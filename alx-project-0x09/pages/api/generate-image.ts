// pages/api/generate-image.ts

import { HEIGHT, WIDTH } from "@/constants"; // Kept as requested, but not used in the final API call body
import { RequestProps } from "@/interfaces";
import { NextApiRequest, NextApiResponse } from "next"


// 🔒 SECURITY FIX 1: Change to a server-side only environment variable
const gptApiKey = process.env.GPT_API_KEY; 

// 🎯 FIX 1: Update the full URL and host to the correct API
const FULL_GPT_URL = 'https://ai-text-to-image-generator-flux-free-api.p.rapidapi.com/aaaaaaaaaaaaaaaaaiimagegenerator/quick.php';
const GPT_HOST = 'ai-text-to-image-generator-flux-free-api.p.rapidapi.com';

// ⚙️ New API Body Requirements
const DEFAULT_STYLE_ID = 4; // Based on the Node.js example
const DEFAULT_SIZE = '1-1'; // Based on the Node.js example


const handler = async (request: NextApiRequest, response: NextApiResponse) => {
    // ⚠️ Remember to rename NEXT_PUBLIC_GPT_API_KEY to GPT_API_KEY in your .env.local file!
    if (!gptApiKey) { 
        return response.status(500).json({ error: "Server error: API key is not configured." });
    }

    try {
        const { prompt }: RequestProps = request.body; 

        if (request.method !== 'POST' || !prompt) {
            return response.status(400).json({ error: "Missing prompt or invalid method." });
        }

        const res = await fetch(FULL_GPT_URL, {
            method: "POST",
            body: JSON.stringify({
                // 🎯 FIX 2: The new API requires 'prompt', 'style_id', and 'size'
                prompt: prompt,         
                style_id: DEFAULT_STYLE_ID,
                size: DEFAULT_SIZE
                // Note: HEIGHT and WIDTH are not used because the new API does not require them.
            }),
            headers: {
                'x-rapidapi-key': gptApiKey.trim(),
                'x-rapidapi-host': GPT_HOST, // 🎯 FIX 3: Correct Host Header
                'Content-Type': 'application/json'
            },
        });

        if (!res.ok) {
            const errorData = await res.json();
            console.error("RapidAPI Error Response:", errorData);
            return response.status(res.status).json({ 
                error: `External API failed with status ${res.status}. Message: ${errorData.message || 'Check API documentation.'}` 
            });
        }

        const data = await res.json();
        
        // This key will depend on the new API's response. We'll use a common guess.
        const imageUrl = data?.image_url || data?.result || data?.generated_image; 
        
        if (!imageUrl) {
             console.error("API response missing image URL:", data);
             return response.status(500).json({ error: "Image URL not found in API response." });
        }

        return response.status(200).json({
            imageUrl: imageUrl, // Use the clearer key name for the client
        });

    } catch (error) {
        console.error("Error in API route:", error);
        return response.status(500).json({ error: "Internal server error" });
    }
}

export default handler;