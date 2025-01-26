
export class FileHelper {
    static resolveHumanizeFileSizeByGivenBytes(bytes: number): string
    {
        if (bytes === 0) return '0 B';

        const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
        const sizeIndex = Math.floor(Math.log(bytes) / Math.log(1024));

        const size = bytes / Math.pow(1024, sizeIndex);

        return `${size.toFixed(2)} ${units[sizeIndex]}`;
    }
}