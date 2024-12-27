import { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Home() {
  const [input, setInput] = useState("");
  const [translation, setTranslation] = useState("");
  const [feature, setFeature] = useState("engToArabic");
  const [summarizationType, setSummarizationType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleFeatureChange = (event) => {
    setFeature(event.target.value);
    setTranslation("");
    setSummarizationType("");
  };

  const handleSummarizationTypeChange = (event) => {
    setSummarizationType(event.target.value);
  };

  const fetchTranslation = async () => {
    try {
      setIsLoading(true);

      // Determine the API endpoint based on the selected feature
      let endpoint = "";
      let data = { text: input };

      if (feature === "engToArabic") {
        endpoint = "http://localhost:5001/translate/en2ar";
      } else if (feature === "arabicToEng") {
        endpoint = "http://localhost:5001/translate/ar2en";
      } else if (feature === "summarization") {
        endpoint = "http://localhost:5001/summarize";
        data.style = summarizationType; // Include summarization type
      }

      if (!endpoint) {
        throw new Error("No valid feature selected.");
      }

      if (!input) {
        setTranslation("Please enter text to process.");
        setIsLoading(false);
        return;
      }
// Log request details
console.log("Sending request to:", endpoint, "with data:", data);
      // Fetch task ID from the API
      const response = await axios.post(endpoint, data);
      console.log("Response from backend:", response.data);
      const taskId = response.data.task_id;

      if (!taskId) {
        throw new Error("No task_id returned from the server.");
      }
      console.log("Task ID received:", taskId);
      // Poll the status endpoint for task completion
      const statusEndpoint = `http://localhost:5001/status/${taskId}`;
      console.log("Polling initiated for:", statusEndpoint);
      const result = await pollTaskStatus(statusEndpoint);

      // Update the translation with the result
      setTranslation(result);
    } catch (error) {
      console.error("Error processing text:", error);
      setTranslation("An error occurred while processing the text.");
    } finally {
      setIsLoading(false);
    }
  };

  // Polling function for task status
  const pollTaskStatus = async (statusEndpoint, maxAttempts = 20, interval = 1000) => {
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await axios.get(statusEndpoint);

        if (response.data && response.data.translated_text) {
          return response.data.translated_text; // Task completed, return the result
        }
      } catch (error) {
        console.warn(`Polling attempt ${attempts + 1} failed:`, error);
      }

      // Increment the attempts and wait before retrying
      attempts += 1;
      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    throw new Error("Task polling timed out.");
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "2rem",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: "2rem",
          borderRadius: "8px",
          maxWidth: "600px",
          width: "100%",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Text Processing
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Select a feature and type below to process your text.
        </Typography>

        {/* Feature Selection */}
        <FormControl fullWidth sx={{ marginBottom: "1.5rem" }}>
          <InputLabel id="feature-select-label">Select Action</InputLabel>
          <Select
            labelId="feature-select-label"
            value={feature}
            onChange={handleFeatureChange}
            label="Select Feature"
          >
            <MenuItem value="engToArabic">English to Arabic Translation</MenuItem>
            <MenuItem value="arabicToEng">Arabic to English Translation</MenuItem>
            <MenuItem value="summarization">Summarization</MenuItem>
          </Select>
        </FormControl>

        {/* Summarization Type Dropdown */}
        {feature === "summarization" && (
          <FormControl fullWidth sx={{ marginBottom: "1.5rem" }}>
            <InputLabel id="summarization-type-select-label">Summarization Type</InputLabel>
            <Select
              labelId="summarization-type-select-label"
              value={summarizationType}
              onChange={handleSummarizationTypeChange}
              label="Summarization Type"
            >
              <MenuItem value="informal">Informal</MenuItem>
              <MenuItem value="formal">Formal</MenuItem>
              <MenuItem value="technical">Technical</MenuItem>
            </Select>
          </FormControl>
        )}

        {/* Text Input */}
        <TextField
          label="Type here"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          fullWidth
          multiline
          sx={{ marginBottom: "1.5rem" }}
        />

        {/* Output Section */}
        <Box
          sx={{
            padding: "1rem",
            backgroundColor: "#f9f9f9",
            border: "1px solid #ccc",
            borderRadius: "4px",
            marginBottom: "1.5rem",
            textAlign: "center",
            position: "relative",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Output:
          </Typography>

          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100px",
              }}
            >
              <Typography variant="body1" color="textSecondary" gutterBottom>
                Processing...
              </Typography>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Typography>
              {translation || "Click 'Process Text' to see the result."}
            </Typography>
          )}
        </Box>

        {/* Process and Upload Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: { xs: "center", sm: "flex-end" },
            gap: "1rem",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={fetchTranslation}
            disabled={isLoading || (feature === "summarization" && !summarizationType)}
            sx={{
              padding: "0.75rem 1.5rem",
              textTransform: "none",
              fontSize: "1rem",
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Process Text
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate("/upload")}
            sx={{
              padding: "0.75rem 1.5rem",
              textTransform: "none",
              fontSize: "1rem",
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Upload
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default Home;