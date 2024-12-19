import React, { useState, useEffect } from "react";
import { Box, TextField, Typography, Button, Paper, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import debounce from "lodash/debounce";

function Home() {
  const [input, setInput] = useState("");
  const [translation, setTranslation] = useState("");
  const [feature, setFeature] = useState("engToArabic");
  const [summarizationType, setSummarizationType] = useState(""); // For summarization type
  const navigate = useNavigate();

  const handleFeatureChange = (event) => {
    setFeature(event.target.value);
    setTranslation("");
    setSummarizationType(""); // Reset summarization type when changing features
  };

  const handleSummarizationTypeChange = (event) => {
    setSummarizationType(event.target.value);
  };

  const fetchTranslation = async (text) => {
    try {
      let endpoint = `/translate/en2ar`;
      let data = { text };

      if (feature === "summarization") {
        endpoint = `/summarize`;
        data = { text, type: summarizationType };
      }

      const response = await axios.post(endpoint, data);
      setTranslation(response.data.result);
    } catch (error) {
      console.error("Error processing text:", error);
    }
  };

  const debouncedFetchTranslation = debounce((text) => {
    if (text && (feature !== "summarization" || summarizationType)) {
      fetchTranslation(text);
    } else {
      setTranslation("");
    }
  }, 300);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    debouncedFetchTranslation(value);
  };

  useEffect(() => {
    return () => {
      debouncedFetchTranslation.cancel();
    };
  }, [debouncedFetchTranslation]);

  const handleUploadRoute = () => {
    navigate("/upload");
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
          onChange={handleInputChange}
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
            {translation || "Start typing to see the result..."}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: { xs: "center", sm: "flex-end" },
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleUploadRoute}
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
