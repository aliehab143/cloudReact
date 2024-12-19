import { useState } from "react";
import { Box, TextField, Typography, Button, Paper, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Home() {
  const [input, setInput] = useState("");
  const [translation, setTranslation] = useState("");
  const [feature, setFeature] = useState("engToArabic");
  const [summarizationType, setSummarizationType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Handle feature selection from the dropdown
  const handleFeatureChange = (event) => {
    setFeature(event.target.value);
    setTranslation(""); // Clear translation output when changing feature
    setSummarizationType(""); // Reset summarization type
  };

  // Handle summarization type selection
  const handleSummarizationTypeChange = (event) => {
    setSummarizationType(event.target.value);
  };

  // Fetch translation or summarization result
  const fetchTranslation = async () => {
    try {
      setIsLoading(true);

      // Determine the API endpoint based on the selected feature
      let endpoint = "";
      let data = { text: input };

      if (feature === "engToArabic") {
        endpoint = "http://localhost/translate/en2ar";
      } else if (feature === "arabicToEng") {
        endpoint = "http://localhost/translate/ar2en";
      } else if (feature === "summarization") {
        endpoint = "http://localhost/summarize";
        data.type = summarizationType; // Include summarization type
      }

      if (!endpoint) {
        throw new Error("No valid feature selected.");
      }

      if (!input) {
        setTranslation("Please enter text to process.");
        setIsLoading(false);
        return;
      }

      // Fetch task ID from the API
      const response = await axios.post(endpoint, data);
      const taskId = response.data.task_id;

      if (taskId) {
        // Poll the status endpoint until task completion
        const statusEndpoint = `${endpoint}/status/${taskId}`;
        let statusResponse = await axios.get(statusEndpoint);

        while (statusResponse.data.status !== "completed") {
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retrying
          statusResponse = await axios.get(statusEndpoint);
        }

        // Set the final result in the translation box
        setTranslation(statusResponse.data.result);
      } else {
        throw new Error("No task_id returned from the server.");
      }
    } catch (error) {
      console.error("Error processing text:", error);
      setTranslation("An error occurred while processing the text.");
    } finally {
      setIsLoading(false);
    }
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

        <TextField
          label="Type here"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          fullWidth
          multiline
          sx={{ marginBottom: "1.5rem" }}
        />

        <Box
          sx={{
            padding: "1rem",
            backgroundColor: "#f9f9f9",
            border: "1px solid #ccc",
            borderRadius: "4px",
            marginBottom: "1.5rem",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Output:
          </Typography>
          <Typography>
            {isLoading ? "Processing..." : translation || "Click 'Process Text' to see the result."}
          </Typography>
        </Box>

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
            onClick={() => navigate("/upload")}
            sx={{
              padding: "0.75rem 1.5rem",
              textTransform: "none",
              fontSize: "1rem",
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Go to Upload Page
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default Home;
