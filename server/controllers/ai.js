const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: "You are a helpful assistant for a note-taking app. Your responses must be in plain text ONLY. Do NOT use Markdown, bolding (*), italics (_), headings (#), lists, or any other formatting symbols."
});

const generateContent = async (req, res) => {

    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json("Prompt is required");
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ text });
    } catch (error) {
        console.error('AI Generation Error:', error);
        res.status(500).json("Failed to generate content: " + error.message);
    }
}

module.exports = {
    generateContent
};
