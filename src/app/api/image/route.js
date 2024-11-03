import sharp from "sharp";
import path from "path";
import fs from "fs";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // Increase the limit if high-resolution images are expected
    },
  },
};

export async function POST(req) {
  try {
    // Parse JSON body to get the base64 image string
    const { image } = await req.json();

    // Decode base64 image data
    const imageBuffer = Buffer.from(image.split(",")[1], "base64");

    // Step 1: Crop the uploaded image to a 1:1 aspect ratio while maintaining orientation
    const croppedImageBuffer = await sharp(imageBuffer)
      .rotate() // Automatically adjust orientation based on EXIF metadata
      .resize({ width: 1000, height: 1000, fit: "cover" }) // Higher resolution for better quality
      .toBuffer();

    // Load the frame (banner) image from the public directory
    const framePath = path.join(process.cwd(), "public", "English.png");
    const frameBuffer = fs.readFileSync(framePath);

    // Get dimensions of the cropped image
    const { width: imageWidth, height: imageHeight } = await sharp(croppedImageBuffer).metadata();

    // Resize the frame to match the width of the cropped image
    const resizedFrameBuffer = await sharp(frameBuffer)
      .resize(imageWidth) // Match the width of the uploaded image
      .toBuffer();

    // Get the height of the resized frame
    const { height: resizedFrameHeight } = await sharp(resizedFrameBuffer).metadata();

    // Step 2: Create a canvas with the dimensions of the uploaded image
    const canvasBuffer = await sharp({
      create: {
        width: imageWidth,
        height: imageHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
      },
    })
      .composite([
        { input: croppedImageBuffer, top: 0, left: 0 }, // Place cropped image at the top
        {
          input: resizedFrameBuffer,
          top: imageHeight - resizedFrameHeight, // Position the frame at the bottom
          left: 0, // Center the frame horizontally
        },
      ])
      .png({ quality: 100, compressionLevel: 0 }) // Max quality and no compression
      .toBuffer();

    // Convert the processed image to base64 to send it back to the client
    const processedImageBase64 = `data:image/png;base64,${canvasBuffer.toString("base64")}`;

    // Return the processed image as JSON response
    return new Response(JSON.stringify({ image: processedImageBase64 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing image:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process image." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
