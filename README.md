# 🧍‍♂️ Posture Detection App

This project detects and analyzes human posture using pose landmarks for real-time feedback. It evaluates different postures such as **squats** and **desk sitting**, and provides alerts based on predefined ergonomic rules.

---
deploy link:
[posture-detection-app-rho.vercel.app](https://posture-detection-app-rho.vercel.app/)

## 📌 Features

- ✅ Real-time posture detection using pose landmarks
- 🦵 Squat posture analysis (e.g., knee-over-toe, back angle)
- 💺 Desk sitting posture analysis (e.g., neck angle, back straightness)
- 🚦 Visual posture alerts (Good / Warning / Bad)
- 📊 Confidence score for posture detection

---

## 🧰 Tech Stack

- **TypeScript**
- **Pose Landmarks Interface** (compatible with TensorFlow.js / MediaPipe)
- **React** (for frontend UI – optional)
- **Node.js / Express** (if using backend – optional)

---

## 📁 Folder Structure

── README.md

yaml
Copy
Edit

---

### 1. Clone the Repo

```bash
git clone https://github.com/yourusername/posture-detection-app.git
cd posture-detection-app
2. Install Dependencies
bash
Copy
Edit
npm install
3. Run the Project (Development Mode)
bash
Copy
Edit
npm run dev
If you're using React:

bash
Copy
Edit
npm start
⚙️ Posture Modes
1. Squat Mode
kneeOverToe: Boolean check for proper form

backAngle: Determines if back is too bent

2. Desk Sitting Mode
neckAngle: Measures neck posture

backStraight: Ensures straight back alignment

📌 Output
The app provides:

An array of posture alerts with messages and status

An overall status: good, warning, or bad

A confidence score between 0 and 1

Example Output:

json
Copy
Edit
{
  "alerts": [
    {
      "type": "warning",
      "message": "Your neck is tilted forward too much.",
      "rule": "neckAngle"
    }
  ],
  "overallStatus": "warning",
  "confidence": 0.87
}
📃 License
This project is licensed under the MIT License.

🙋‍♂️ Author
Made by Rutwik B.
Feel free to contribute or raise issues!

