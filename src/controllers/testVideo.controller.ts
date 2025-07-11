import { Request, Response, NextFunction } from 'express';
import { exec } from 'child_process';
import path from 'path';

 export const testFfmpegConversion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const inputPath = `"/Users/michaelmac/Downloads/13649158_2160_3840_60fps.mp4"`;
        const outputPath = `"/Users/michaelmac/Downloads/InstagramStyle.mp4"`;

        const ffmpegCmd = `ffmpeg -i ${inputPath} -vf "scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2" -r 30 -c:v libx264 -profile:v high -b:v 3M -pix_fmt yuv420p -preset slow -movflags +faststart -c:a aac -b:a 128k ${outputPath}`;

        exec(ffmpegCmd, (error, stdout, stderr) => {
            if (error) {
                console.error('FFmpeg error:', error);
                return res.status(500).json({ message: 'FFmpeg execution failed', error: error.message });
            }

            console.log('FFmpeg stdout:', stdout);
            console.log('FFmpeg stderr:', stderr);

            return res.status(200).json({ message: 'FFmpeg command executed successfully' });
        });
    } catch (err) {
        console.error('Unexpected error:', err);
        return res.status(500).json({ message: 'Internal server error', error: err });
    }
};



