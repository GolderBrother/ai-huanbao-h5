export const validate = {
    isEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    },

    isPhone(phone: string): boolean {
        return /^1[3-9]\d{9}$/.test(phone)
    },

    isUrl(url: string): boolean {
        try {
            new URL(url)
            return true
        } catch {
            return false
        }
    }
}