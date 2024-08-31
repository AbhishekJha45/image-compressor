class TimeUtils {
    currentIstEpochTimestamp() {
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(now.getTime() + istOffset);
        return Math.floor(istDate.getTime() / 1000);
    }

    // Get the current timestamp in UTC
    currentUtcEpochTimestamp() {
        const now = new Date();
        return Math.floor(now.getTime() / 1000);
    }
}

module.exports = TimeUtils;
