import { defineComponent, ref, onMounted, onUnmounted } from "vue";
import { useChatStore } from "@/stores/chat";
import StatusBar from "@/components/StatusBar";
import BottomNav from "@/components/BottomNav";
import type { AIModel } from "@/types";
import "./index.scss";
import type {
  SpeechRecognition,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
} from "@/types/speech";
import OSS from "ali-oss";
import { API_CONFIG } from "@/config";

type Timer = ReturnType<typeof setTimeout>;

// 在setup函数外部添加类型定义
interface OSSConfig {
  REGION: string;
  ACCESS_KEY_ID: string;
  ACCESS_KEY_SECRET: string;
  BUCKET: string;
  ENDPOINT: string;
}

interface QwenVLConfig {
  API_KEY: string;
  API_URL: string;
  MODEL: string;
}

interface APIConfig {
  ALIYUN_OSS: OSSConfig;
  QWEN_VL: QwenVLConfig;
}

export default defineComponent({
  name: "SeeForMe",
  setup() {
    const chatStore = useChatStore();
    const videoRef = ref<HTMLVideoElement | null>(null);
    const cameraStream = ref<MediaStream | null>(null);
    const isListening = ref(false);
    const isAnalyzing = ref(false);
    const currentScene = ref("qa");
    const aiMessage = ref("点击下方场景选项开始体验，或直接开始提问...");
    const statusText = ref("正在录制");
    const statusIcon = ref("circle");
    const isStatusAnalyzing = ref(false);
    const continuousObservationTimer = ref<Timer | null>(null);
    const blindModeTimer = ref<Timer | null>(null);
    const blindModeInterval = ref<Timer | null>(null);
    const blindModeStartTime = ref<number | null>(null);
    const recognition = ref<SpeechRecognition | null>(null);
    const voiceButtonRef = ref<HTMLButtonElement | null>(null);
    const isVoiceListening = ref(false);

    // 场景选项
    const scenes = [
      { id: "qa", icon: "comments", text: "你问我答" },
      { id: "continuous", icon: "eye", text: "持续观察" },
      { id: "blind", icon: "walking", text: "盲人出行" },
      { id: "diabetes", icon: "utensils", text: "糖尿病饮食" },
    ];

    // 初始化摄像头
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        console.log('captureImage111 stream', stream)
        if (videoRef.value) {
          videoRef.value.srcObject = stream;
          cameraStream.value = stream;

          // 等待视频元素加载完成
          await new Promise<void>((resolve) => {
            if (!videoRef.value) return;

            const handleLoadedMetadata = () => {
              videoRef.value?.removeEventListener('loadedmetadata', handleLoadedMetadata);
              resolve();
            };

            if (videoRef.value.readyState >= 2) {
              resolve();
            } else {
              videoRef.value.addEventListener('loadedmetadata', handleLoadedMetadata);
            }
          });
        }
      } catch (error) {
        console.error("摄像头访问失败:", error);
        aiMessage.value =
          "无法访问摄像头。请确保您已授予摄像头权限，并刷新页面重试。";
      }
    };

    // 添加语音识别初始化函数
    const initSpeechRecognition = () => {
      if ("webkitSpeechRecognition" in window) {
        recognition.value = new (window as any).webkitSpeechRecognition();
        if (!recognition.value) return;
        recognition.value.continuous = false;
        recognition.value.interimResults = true;
        recognition.value.lang = "zh-CN";

        recognition.value.onstart = () => {
          isListening.value = true;
          isVoiceListening.value = true;
          statusText.value = "正在聆听...";
          statusIcon.value = "microphone";
          isStatusAnalyzing.value = true;
          if (voiceButtonRef.value) {
            voiceButtonRef.value.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            voiceButtonRef.value.style.color = '#0084ff';
          }
        };

        recognition.value.onend = () => {
          isListening.value = false;
          isVoiceListening.value = false;
          if (voiceButtonRef.value) {
            voiceButtonRef.value.innerHTML = '<i class="fas fa-microphone"></i>';
            voiceButtonRef.value.style.color = '#333';
          }
          
          if ((currentScene.value === "qa" || currentScene.value === "diabetes") && 
              !isAnalyzing.value && !window.speechSynthesis.speaking) {
            setTimeout(() => {
              try {
                recognition.value?.start();
              } catch (error) {
                console.error("重新启动语音识别失败:", error);
              }
            }, 100);
          }
        };

        recognition.value.onresult = async (event: SpeechRecognitionEvent) => {
          const result = event.results[event.results.length - 1];
          if (result.isFinal) {
            const question = result.item(0).transcript.trim();
            if (question) {
              isAnalyzing.value = true;
              stopSpeaking();
              recognition.value?.stop();

              try {
                if (currentScene.value === "diabetes") {
                  await handleDiabetesQuestion(question);
                } else if (currentScene.value === "qa") {
                  await handleQuestionAndAnalyze(question);
                }
              } catch (error) {
                console.error("处理问题时出错:", error);
                aiMessage.value = "处理问题时出现错误，请重新提问。";
              } finally {
                isAnalyzing.value = false;
              }
            }
          }
        };

        recognition.value.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("语音识别错误:", event.error);
          isListening.value = false;
          isVoiceListening.value = false;
          if (voiceButtonRef.value) {
            voiceButtonRef.value.innerHTML = '<i class="fas fa-microphone"></i>';
            voiceButtonRef.value.style.color = '#333';
          }

          if (event.error === "no-speech" || event.error === "audio-capture") {
            if (currentScene.value === "qa" && !isAnalyzing.value) {
              setTimeout(() => {
                try {
                  recognition.value?.start();
                } catch (error) {
                  console.error("重新启动语音识别失败:", error);
                }
              }, 1000);
            }
          }
        };
      }
    };

    // 添加语音播报功能
    const stopSpeaking = () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };

    const speakAnswer = (text: string) => {
      stopSpeaking();

      if ("speechSynthesis" in window) {
        const speech = new SpeechSynthesisUtterance();
        speech.text = text;
        speech.lang = "zh-CN";
        speech.rate = 1;
        speech.pitch = 1;

        speech.onend = () => {
          if (
            (currentScene.value === "qa" ||
              currentScene.value === "diabetes") &&
            !isAnalyzing.value
          ) {
            setTimeout(() => {
              try {
                recognition.value?.start();
              } catch (error) {
                console.error("重新启动语音识别失败:", error);
              }
            }, 500);
          }
        };

        window.speechSynthesis.speak(speech);
      }
    };

    // 场景切换处理
    const handleSceneChange = async (sceneId: string) => {
      if (sceneId === currentScene.value) return;

      cleanupScene();
      currentScene.value = sceneId;

      switch (sceneId) {
        case "qa":
          aiMessage.value =
            "已启用你问我答模式。请说出您的问题，我会实时拍照并为您解答。";
          statusText.value = "等待提问...";
          statusIcon.value = "microphone";
          // 初始化并启动语音识别
          if (!recognition) {
            initSpeechRecognition();
          }
          break;
        case "continuous":
          aiMessage.value =
            "已启用持续观察模式。我会每20秒拍摄一次照片，持续60秒，并对场景变化进行解读。";
          statusText.value = "持续观察中";
          statusIcon.value = "circle";
          setTimeout(() => {
            startContinuousObservation();
          }, 500);
          break;
        case "blind":
          aiMessage.value =
            "已启用盲人出行场景。系统将每5秒为您分析一次周围环境，持续30秒。请保持手机摄像头稳定，对准前方路况。";
          statusText.value = "盲人出行中";
          statusIcon.value = "circle";
          setTimeout(() => {
            startBlindMode();
          }, 500);
          break;
        case "diabetes":
          aiMessage.value =
            "已启用糖尿病饮食场景。请将摄像头对准食物，说出您的问题，我会为您分析食物是否适合食用。";
          statusText.value = "等待提问...";
          statusIcon.value = "microphone";
          // 初始化并启动语音识别
          if (!recognition.value) {
            initSpeechRecognition();
          }
          if (recognition.value) {
            try {
              recognition.value?.start();
            } catch (error) {
              console.error('启动语音识别失败:', error);
              setTimeout(() => {
                recognition.value?.start?.();
              }, 1000);
            }
          }
          break;
      }
    };

    // 实现持续观察模式
    const startContinuousObservation = async () => {
      if (isAnalyzing.value || currentScene.value !== "continuous") return;
      isAnalyzing.value = true;

      // 立即执行一次拍照和分析
      await captureAndAnalyze();

      // 设置定时器，每20秒执行一次
      continuousObservationTimer.value = setInterval(async () => {
        if (currentScene.value !== "continuous") {
          clearInterval(continuousObservationTimer.value!);
          continuousObservationTimer.value = null;
          isAnalyzing.value = false;
          return;
        }
        await captureAndAnalyze();
      }, 20000);

      // 60秒后自动停止
      setTimeout(() => {
        if (continuousObservationTimer.value) {
          clearInterval(continuousObservationTimer.value);
          continuousObservationTimer.value = null;
          isAnalyzing.value = false;
          if (currentScene.value === "continuous") {
            aiMessage.value = "持续观察已完成，如需继续使用请重新点击启用。";
            statusText.value = "等待启用";
            statusIcon.value = "circle";
          }
        }
      }, 60000);
    };

    // 实现盲人出行模式
    const startBlindMode = async () => {
      if (currentScene.value !== "blind") return;

      if (blindModeTimer.value) {
        clearTimeout(blindModeTimer.value);
        blindModeTimer.value = null;
      }
      if (blindModeInterval.value) {
        clearInterval(blindModeInterval.value);
        blindModeInterval.value = null;
      }

      blindModeStartTime.value = Date.now();
      await captureAndAnalyzeForBlind();

      blindModeInterval.value = setInterval(async () => {
        if (currentScene.value !== "blind") {
          clearInterval(blindModeInterval.value!);
          blindModeInterval.value = null;
          return;
        }

        if (Date.now() - blindModeStartTime.value! >= 30000) {
          clearInterval(blindModeInterval.value!);
          blindModeInterval.value = null;
          if (currentScene.value === "blind") {
            aiMessage.value =
              "盲人出行场景已结束，如需继续使用请重新点击启用。";
            statusText.value = "等待启用";
            statusIcon.value = "circle";
          }
          return;
        }

        await captureAndAnalyzeForBlind();
      }, 5000);

      blindModeTimer.value = setTimeout(() => {
        if (blindModeInterval.value) {
          clearInterval(blindModeInterval.value);
          blindModeInterval.value = null;
        }
      }, 30000);
    };

    // 实现拍照和分析功能
    const captureAndAnalyze = async () => {
      try {
        const imageUrl = await captureImage();
        const analysis = await analyzeImage(imageUrl);
        updateAIMessage(analysis);
      } catch (error) {
        console.error("拍照分析过程出错:", error);
        aiMessage.value = "分析过程中出现错误，将在下一次尝试继续。";
      }
    };

    // 实现盲人场景的拍照分析
    const captureAndAnalyzeForBlind = async () => {
      try {
        statusText.value = "正在分析环境";
        statusIcon.value = "spinner";
        isStatusAnalyzing.value = true;

        const imageUrl = await captureImage();
        const analysis = await analyzeBlindScene(imageUrl);
        updateAIMessage(analysis);
      } catch (error) {
        console.error("盲人场景分析错误:", error);
        aiMessage.value = "分析过程中出现错误，将在下次继续尝试。";
      } finally {
        statusText.value = "盲人出行中";
        statusIcon.value = "circle";
        isStatusAnalyzing.value = false;
      }
    };

    // 实现问答场景的分析
    const handleQuestionAndAnalyze = async (question: string) => {
      try {
        isAnalyzing.value = true;
        statusText.value = "正在分析";
        statusIcon.value = "spinner";
        isStatusAnalyzing.value = true;

        const imageUrl = await captureImage();
        const analysis = await analyzeImageWithQuestion(imageUrl, question);
        updateAIMessage(analysis);
      } catch (error) {
        console.error("问答分析过程出错:", error);
        aiMessage.value = "分析过程中出现错误，请重新提问。";
      } finally {
        isAnalyzing.value = false;
        statusText.value = "等待语音播报完成...";
        statusIcon.value = "microphone";
        isStatusAnalyzing.value = false;
      }
    };

    // 实现糖尿病饮食场景的分析
    const handleDiabetesQuestion = async (question: string) => {
      try {
        statusText.value = "正在分析食物";
        statusIcon.value = "spinner";
        isStatusAnalyzing.value = true;

        const imageUrl = await captureImage();
        const analysis = await analyzeDiabetesFood(imageUrl, question);
        updateAIMessage(analysis);
      } catch (error) {
        console.error("糖尿病饮食分析错误:", error);
        aiMessage.value = "分析过程中出现错误，请重新提问。";
      } finally {
        statusText.value = "等待提问...";
        statusIcon.value = "microphone";
        isStatusAnalyzing.value = false;
      }
    };

    // 更新 AI 消息
    const updateAIMessage = (analysis: string) => {
      const timestamp = new Date().toLocaleTimeString();

      // 根据当前场景更新状态标签
      if (currentScene.value === 'continuous') {
        statusText.value = '持续观察中'
        statusIcon.value = 'circle'
        isStatusAnalyzing.value = false
      }

      // 添加时间戳到分析结果
      aiMessage.value = `[${timestamp}] ${analysis}`

      // 使用语音播报结果
      speakAnswer(analysis)
    }

    // 清理场景函数
    const cleanupScene = () => {
      // 停止摄像头流
      if (cameraStream.value) {
        cameraStream.value.getTracks().forEach((track) => track.stop());
        cameraStream.value = null;
      }

      // 停止语音播报
      stopSpeaking();

      // 停止语音识别
      if (recognition.value && (isListening.value || isVoiceListening.value)) {
        recognition.value.stop();
        isListening.value = false;
        isVoiceListening.value = false;
        if (voiceButtonRef.value) {
          voiceButtonRef.value.innerHTML = '<i class="fas fa-microphone"></i>';
          voiceButtonRef.value.style.color = '#333';
        }
      }

      // 清理持续观察模式的定时器
      if (continuousObservationTimer.value) {
        clearInterval(continuousObservationTimer.value);
        continuousObservationTimer.value = null;
      }

      // 清理盲人出行模式的定时器
      if (blindModeTimer.value) {
        clearTimeout(blindModeTimer.value);
        blindModeTimer.value = null;
      }

      if (blindModeInterval.value) {
        clearInterval(blindModeInterval.value);
        blindModeInterval.value = null;
      }

      // 重置所有状态
      blindModeStartTime.value = null;
      isAnalyzing.value = false;
      isStatusAnalyzing.value = false;

      // 重置状态显示
      statusText.value = "正在录制";
      statusIcon.value = "circle";

      // 如果需要重新初始化摄像头
      if (!cameraStream.value) {
        initCamera();
      }
    };

    // 拍照并返回图片URL
    const captureImage = async (): Promise<string> => {
      try {
        console.log(`captureImage videoRef.value`, videoRef.value)
        console.log(`captureImage cameraStream.value`, cameraStream.value)
        if (!videoRef.value || !cameraStream.value) {
          throw new Error("视频流未就绪");
        }

        // 确保视频已经准备好
        if (videoRef.value.readyState < 2) {
          await new Promise<void>((resolve) => {
            if (!videoRef.value) return;

            const handleLoadedData = () => {
              videoRef.value?.removeEventListener('loadeddata', handleLoadedData);
              resolve();
            };

            videoRef.value.addEventListener('loadeddata', handleLoadedData);
          });
        }

        const canvas = document.createElement("canvas");
        // 使用视频的实际尺寸
        canvas.width = videoRef.value.videoWidth || videoRef.value.clientWidth;
        canvas.height = videoRef.value.videoHeight || videoRef.value.clientHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("无法获取canvas上下文");
        }

        ctx.drawImage(videoRef.value, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL("image/jpeg", 0.8);

        // 上传到OSS并返回URL
        return await uploadImageToOSS(base64Image);
      } catch (error) {
        console.error("拍照失败:", error);
        throw error;
      }
    };

    // 上传图片到OSS
    const uploadImageToOSS = async (base64Image: string): Promise<string> => {
      try {
        if (!API_CONFIG?.ALIYUN_OSS) {
          throw new Error("OSS配置未找到");
        }

        const ossConfig = API_CONFIG.ALIYUN_OSS;
        if (
          !ossConfig.REGION ||
          !ossConfig.ACCESS_KEY_ID ||
          !ossConfig.ACCESS_KEY_SECRET ||
          !ossConfig.BUCKET
        ) {
          throw new Error("OSS配置不完整");
        }

        const client = new OSS({
          region: ossConfig.REGION,
          accessKeyId: ossConfig.ACCESS_KEY_ID,
          accessKeySecret: ossConfig.ACCESS_KEY_SECRET,
          bucket: ossConfig.BUCKET,
          endpoint: ossConfig.ENDPOINT,
          secure: true,
        });

        // 处理base64数据
        const base64Pattern = /^data:image\/(png|jpeg|jpg);base64,/;
        const matches = base64Image.match(base64Pattern);
        if (!matches) {
          throw new Error("无效的base64图片格式");
        }

        const base64Data = base64Image.replace(base64Pattern, "");
        const buffer = new Uint8Array(
          atob(base64Data)
            .split("")
            .map((char) => char.charCodeAt(0))
        );
        const blob = new Blob([buffer], { type: "image/jpeg" });

        const timestamp = new Date().getTime();
        const fileName = `see-for-me/${timestamp}.jpg`;

        const result = await client.put(fileName, blob, {
          mime: "image/jpeg",
        });

        return result.url;
      } catch (error) {
        console.error("OSS上传错误:", error);
        throw error;
      }
    };

    // 基础图片分析
    const analyzeImage = async (imageUrl: string): Promise<string> => {
      return await callVisionModel(
        imageUrl,
        "简要描述这个场景的核心信息，100字以内。"
      );
    };

    // 盲人场景分析
    const analyzeBlindScene = async (imageUrl: string): Promise<string> => {
      const prompt = `请简短描述以下关键信息：
1. 前方是否有障碍物（如果有，请描述障碍物是什么和位置）
2. 周围是否有车辆（如果有，请描述车辆的位置）
3. 红绿灯状态（如果有，请描述红绿灯颜色和剩余时间）
4. 周围有没有行人（如果有，请描述行人方向）
如果没有识别到障碍物、车辆、红绿灯、行人，则描述该图片，不用解读是否有障碍物、车辆、行人。
请用最简短的语言描述，不超过30个字。`;

      return await callVisionModel(imageUrl, prompt);
    };

    // 问答场景分析
    const analyzeImageWithQuestion = async (
      imageUrl: string,
      question: string
    ): Promise<string> => {
      return await callVisionModel(imageUrl, question);
    };

    // 糖尿病饮食分析
    const analyzeDiabetesFood = async (
      imageUrl: string,
      question: string
    ): Promise<string> => {
      const prompt = `作为专业的糖尿病营养师，请分析以下内容：
1. 识别图中所有食物
2. 每种食物的升糖指数(GI)和建议食用量
3. 食用注意事项
4. 替代建议（如果不适合食用）
用户问题：${question}
如果图片中没有食物，请直接回复"未识别到食物，请重新拍摄"`;

      return await callVisionModel(imageUrl, prompt);
    };

    // 调用视觉模型API
    const callVisionModel = async (
      imageUrl: string,
      prompt: string
    ): Promise<string> => {
      try {
        if (!API_CONFIG?.QWEN_VL) {
          throw new Error("视觉模型配置未找到");
        }

        const visionConfig = API_CONFIG.QWEN_VL;
        if (!visionConfig.API_KEY || !visionConfig.API_URL) {
          throw new Error("视觉模型配置不完整");
        }

        const response = await fetch(visionConfig.API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${visionConfig.API_KEY}`,
          },
          body: JSON.stringify({
            model: visionConfig.MODEL,
            messages: [
              {
                role: "system",
                content:
                  "你是一个专业的图像分析助手，请根据用户的具体需求分析图片并给出准确的回答。",
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: prompt,
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: imageUrl,
                    },
                  },
                ],
              },
            ],
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`视觉模型API调用失败: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
      } catch (error) {
        console.error("视觉模型分析错误:", error);
        throw error;
      }
    };

    // 添加语音按钮点击处理函数
    const handleVoiceButtonClick = () => {
      if (!recognition.value) {
        console.warn('该浏览器不支持语音识别功能')
        return
      }

      if (!isVoiceListening.value) {
        // 开始录音
        try {
          recognition.value.start()
          isVoiceListening.value = true
          if (voiceButtonRef.value) {
            voiceButtonRef.value.innerHTML = '<i class="fas fa-microphone-slash"></i>'
            voiceButtonRef.value.style.color = '#0084ff'
          }
          aiMessage.value = '正在聆听...'
          statusText.value = '正在聆听...'
          statusIcon.value = 'microphone'
        } catch (error) {
          console.error('启动语音识别失败:', error)
        }
      } else {
        // 停止录音
        recognition.value.stop()
        isVoiceListening.value = false
        if (voiceButtonRef.value) {
          voiceButtonRef.value.innerHTML = '<i class="fas fa-microphone"></i>'
          voiceButtonRef.value.style.color = '#333'
        }
        statusText.value = '等待提问...'
        statusIcon.value = 'microphone'
      }
    }

    onMounted(() => {
      initCamera();
      initSpeechRecognition();
    });

    onUnmounted(() => {
      cleanupScene();
      stopSpeaking();
    });

    return () => (
      <div class="page-container">
        <StatusBar />

        {/* 头部 */}
        <div class="header">
          <div class="back-button" onClick={() => history.back()}>
            <i class="fas fa-chevron-left"></i>
          </div>
          帮我看看
        </div>

        {/* 内容区域 */}
        <div class="page-content">
          {/* 场景选择区域 */}
          <div class="scene-selector">
            {scenes.map((scene) => (
              <div
                key={scene.id}
                class={`scene-button ${currentScene.value === scene.id ? "active" : ""
                  }`}
                onClick={() => handleSceneChange(scene.id)}
              >
                <i class={`fas fa-${scene.icon}`}></i>
                <span>{scene.text}</span>
              </div>
            ))}
          </div>

          {/* 摄像头视图区域 */}
          <div class="camera-view">
            <video
              ref={(dom) => (videoRef.value = dom as HTMLVideoElement)}
              id="cameraFeed"
              autoplay
              playsinline
            ></video>

            {/* 状态标签 */}
            <div
              class={`status-badge ${isStatusAnalyzing.value ? "analyzing" : ""
                }`}
            >
              <i class={`fas fa-${statusIcon.value}`}></i>
              {statusText.value}
            </div>

            {/* AI分析结果区域 */}
            <div class="ai-analysis">
              <div class="ai-title">
                <i class="fas fa-robot"></i>
                AI分析结果
                <button 
                  ref={voiceButtonRef}
                  class="action-button voice-button"
                  onClick={handleVoiceButtonClick}
                >
                  <i class="fas fa-microphone"></i>
                </button>
              </div>
              <div class="ai-message">{aiMessage.value}</div>
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    );
  },
});
