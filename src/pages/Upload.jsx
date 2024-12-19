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
import axios from "axios";
import FileSaver from "file-saver";

function Upload() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [action, setAction] = useState("engToArabic"); // Default action

  const handleActionChange = (event) => {
    setAction(event.target.value);
  };

  const handleFileUpload = async () => {
    if (!file) return;
    setIsProcessing(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("action", action); // Include the selected action in the form data

    try {
      const response = await axios.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const downloadUrl = `/process/${response.data.id}/download`;
      FileSaver.saveAs(downloadUrl, file.name);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsProcessing(false);
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
          maxWidth: "500px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Upload Your Document
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Select a file and an action to process it.
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            marginTop: "1rem",
          }}
        >
          {/* Dropdown to select action */}
          <FormControl fullWidth>
            <InputLabel id="action-select-label">Select Action</InputLabel>
            <Select
              labelId="action-select-label"
              value={action}
              onChange={handleActionChange}
              label="Select Action"
              sx={{ marginBottom: "1rem" }}
            >
              <MenuItem value="engToArabic">English to Arabic Translation</MenuItem>
              <MenuItem value="arabicToEng">Arabic to English Translation</MenuItem>
              <MenuItem value="summarization">Summarization</MenuItem>
            </Select>
          </FormControl>

          {/* Styled File Input */}
          <Button
            variant="outlined"
            component="label"
            color="primary"
            fullWidth
            sx={{
              padding: "0.75rem",
              fontWeight: "bold",
              fontSize: "1rem",
              textTransform: "none",
              border: "2px solid",
              borderColor: "primary.main",
            }}
          >
            Choose File
            <input
              type="file"
              hidden
              onChange={(e) => setFile(e.target.files[0])}
            />
          </Button>
          {file && (
            <Typography variant="body2" color="textSecondary">
              Selected File: {file.name}
            </Typography>
          )}

          {/* Upload Button */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleFileUpload}
            disabled={!file || isProcessing}
            fullWidth
            sx={{
              padding: "0.75rem",
              fontWeight: "bold",
              fontSize: "1rem",
              textTransform: "none",
            }}
          >
            {isProcessing ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Upload and Process"
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default Upload;
