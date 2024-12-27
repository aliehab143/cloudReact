import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import axios from "axios";

function Upload() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feature, setFeature] = useState("engToArabic");
  const [summarizationType, setSummarizationType] = useState("");
  const [input, setInput] = useState("");
  const [translation, setTranslation] = useState("");

  const handleFeatureChange = (event) => {
    setFeature(event.target.value);
    setTranslation("");
    setSummarizationType("");
  };

  const handleSummarizationTypeChange = (event) => {
    setSummarizationType(event.target.value);
  };

  const handleFileUpload = async () => {
    if (!file) return;
    setIsProcessing(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Upload file and get extracted text
      const response = await axios.post("http://localhost:5001/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const text = response.data.extractedText; // Assume backend returns extracted text
      setInput(text); // Populate the input field
    } catch (error) {
      console.error("Error extracting text from file:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchTranslation = async () => {
    try {
      setIsProcessing(true);
  
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
        setTranslation("Please upload a file to process.");
        setIsProcessing(false);
        return;
      }
  
      // Send the initial POST request to start the processing
      const response = await axios.post(endpoint, data);
      const taskId = response.data.task_id;
  
      if (!taskId) {
        throw new Error("Task ID not received from server.");
      }
  
      // Poll the status endpoint to get the result
      const result = await pollTaskStatus(`http://localhost:5001/status/${taskId}`);
      setTranslation(result);
    } catch (error) {
      console.error("Error processing text:", error);
      setTranslation("An error occurred while processing the text.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Polling function to check task status
  const pollTaskStatus = async (statusEndpoint, maxAttempts = 20, interval = 1000) => {
    let attempts = 0;
  
    while (attempts < maxAttempts) {
      try {
        const response = await axios.get(statusEndpoint);
  
        // If the task is complete, return the result
        if (response.data && (response.data.translated_text || response.data.summary)) {
          return response.data.translated_text || response.data.summary;
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
          File Text Processing
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Upload a file to process its text.
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

        {/* Summarization Type */}
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
          label="Extracted Text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          fullWidth
          multiline
          rows={5}
          sx={{ marginBottom: "1.5rem" }}
        />

        {/* File Upload */}
        <Button
          variant="outlined"
          component="label"
          color="primary"
          fullWidth
          sx={{ marginBottom: "1.5rem" }}
        >
          Upload File
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            hidden
            onChange={(e) => setFile(e.target.files[0])}
          />
        </Button>
        {file && (
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Selected File: {file.name}
          </Typography>
        )}

        <Button
          variant="contained"
          color="secondary"
          onClick={handleFileUpload}
          fullWidth
          disabled={!file || isProcessing}
        >
          {isProcessing ? (
            <CircularProgress size={24} />
          ) : (
            "Extract Text"
          )}
        </Button>

        {/* Output Section */}
        <Box
          sx={{
            padding: "1rem",
            backgroundColor: "#f9f9f9",
            border: "1px solid #ccc",
            borderRadius: "4px",
            marginTop: "1.5rem",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Output:
          </Typography>
          {isProcessing ? (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Typography>
              {translation || "Click 'Process Text' to see the result."}
            </Typography>
          )}
        </Box>

        {/* Process Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={fetchTranslation}
          fullWidth
          sx={{ marginTop: "1.5rem" }}
          disabled={isProcessing || (feature === "summarization" && !summarizationType)}
        >
          Process Text
        </Button>
      </Paper>
    </Box>
  );
}

export default Upload;