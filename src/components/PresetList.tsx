import { useCallback, useState, type CSSProperties } from "react";
import type { SimPreset } from "../types/SimPreset";
import {
  deleteStoredPreset,
  listStoredPresets,
  loadStoredPreset,
  saveStoredPreset,
} from "../utils/PresetStorage";

export type PresetListProps = {
  exportPreset: () => SimPreset;
  onLoadPreset: (preset: SimPreset) => void;
};

const buttonStyle: CSSProperties = {
  padding: "4px 8px",
  fontSize: "11px",
  cursor: "pointer",
  backgroundColor: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.3)",
  borderRadius: "4px",
  color: "white",
};

const inputStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  padding: "6px 8px",
  fontSize: "12px",
  backgroundColor: "rgba(0,0,0,0.3)",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: "4px",
  color: "white",
  outline: "none",
};

export default function PresetList(props: PresetListProps) {
  const [presets, setPresets] = useState(listStoredPresets);
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const refreshPresets = useCallback(() => {
    setPresets(listStoredPresets());
  }, []);

  const showMessage = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2000);
  };

  const handleSave = () => {
    const result = saveStoredPreset(name, props.exportPreset());
    if (!result.ok) {
      showMessage(result.error);
      return;
    }

    setName("");
    refreshPresets();
    showMessage("Preset saved");
  };

  const handleLoad = (presetName: string) => {
    const preset = loadStoredPreset(presetName);
    if (!preset) {
      showMessage("Failed to load preset");
      refreshPresets();
      return;
    }

    props.onLoadPreset(preset);
    showMessage(`Loaded "${presetName}"`);
  };

  const handleDelete = (presetName: string) => {
    deleteStoredPreset(presetName);
    refreshPresets();
    showMessage(`Deleted "${presetName}"`);
  };

  return (
    <div style={{ marginTop: "20px", borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: "15px" }}>
      <div
        style={{
          fontSize: "14px",
          fontWeight: "bold",
          marginBottom: "10px",
        }}
      >
        Saved Presets
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
          placeholder="Preset name"
          style={inputStyle}
        />
        <button style={buttonStyle} onClick={handleSave}>
          Save
        </button>
      </div>

      {message && (
        <p
          style={{
            margin: "0 0 10px",
            fontSize: "12px",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          {message}
        </p>
      )}

      <div
        style={{
          maxHeight: "160px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          scrollbarWidth: "thin",
          scrollbarColor: "#444 transparent",
        }}
      >
        {presets.length === 0 ? (
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            No saved presets yet
          </p>
        ) : (
          presets.map((entry) => (
            <div
              key={entry.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 8px",
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: "4px",
              }}
            >
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: "12px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={entry.name}
              >
                {entry.name}
              </span>
              <button style={buttonStyle} onClick={() => handleLoad(entry.name)}>
                Load
              </button>
              <button
                style={{
                  ...buttonStyle,
                  backgroundColor: "rgba(255,80,80,0.15)",
                  borderColor: "rgba(255,80,80,0.4)",
                }}
                onClick={() => handleDelete(entry.name)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
