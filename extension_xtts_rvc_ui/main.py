import torch
from TTS.api import TTS
import gradio as gr
import os, requests
from pathlib import Path


def extension__tts_generation_webui():
    main_ui()
    return {
        "package_name": "extension_xtts_simple",
        "name": "XTTS-Simple",
        "version": "0.0.1",
        "requirements": "git+https://github.com/rsxdalv/extension_xtts_rvc_ui@simple",
        "description": "XTTS-Simple is a Gradio UI for XTTSv2",
        "extension_type": "interface",
        "extension_class": "text-to-speech",
        "author": "rsxdalv",
        "extension_author": "rsxdalv",
        "license": "MIT",
        "website": "https://github.com/rsxdalv/extension_xtts_rvc_ui",
        "extension_website": "https://github.com/rsxdalv/extension_xtts_rvc_ui",
        "extension_platform_version": "0.0.1",
    }


def download_models():
    Path("./data/models/xtts").mkdir(parents=True, exist_ok=True)
    xtts_files = [
        "vocab.json",
        "config.json",
        "dvae.path",
        "mel_stats.pth",
        "model.pth",
    ]

    for file in xtts_files:
        if not os.path.isfile(f"./data/models/xtts/{file}"):
            print(f"Downloading {file}")
            r = requests.get(
                f"https://huggingface.co/coqui/XTTS-v2/resolve/v2.0.2/{file}"
            )
            with open(f"./data/models/xtts/{file}", "wb") as f:
                f.write(r.content)


tts = None


def get_TTS():
    global tts
    if tts is None:
        download_models()
        device = "cuda:0" if torch.cuda.is_available() else "cpu"
        print("Device: " + device)
        tts = TTS(
            model_path="./data/models/xtts",
            config_path="./data/models/xtts/config.json",
        ).to(device)
    return tts


def run_xtts(voice: str, text: str, language: str):
    tts = get_TTS()
    wav = tts.tts(
        text=text,
        speaker_wav=voice,
        language=language,
    )
    import numpy as np

    return (tts.config.audio["output_sample_rate"], np.array(wav))  # type: ignore


def main_ui():
    with gr.Row():
        gr.Markdown(
            """
			# XTTS-Simple
			A simple UI for XTTS-v2.
		"""
        )
    with gr.Row():
        with gr.Column():
            lang_dropdown = gr.Dropdown(
                choices=[
                    "en",
                    "es",
                    "fr",
                    "de",
                    "it",
                    "pt",
                    "pl",
                    "tr",
                    "ru",
                    "nl",
                    "cs",
                    "ar",
                    "zh-cn",
                    "hu",
                    "ko",
                    "ja",
                    "hi",
                ],
                value="en",
                label="Language",
            )
            voice_file = gr.Audio(
                label="Voice sample",
                type="filepath",
                sources=["upload", "microphone"],
            )
            text_input = gr.Textbox(placeholder="Write here...")
            generate_only_button = gr.Button(value="Generate")

        with gr.Column():
            audio_output = gr.Audio(label="TTS result", type="filepath")

    generate_only_button.click(
        inputs=[
            voice_file,
            text_input,
            lang_dropdown,
        ],
        outputs=[audio_output],
        fn=run_xtts,
        api_name="xtts_simple",
    )


def main():
    with gr.Blocks(title="TTS RVC UI") as interface:
        main_ui()
    interface.launch(server_name="0.0.0.0", server_port=5000, quiet=True)


if __name__ == "__main__":
    main()
