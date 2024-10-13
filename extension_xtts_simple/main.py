import torch
import gradio as gr
import os, requests
from pathlib import Path
from tts_webui.utils.list_dir_models import model_select_ui, unload_model_button
from tts_webui.utils.randomize_seed import randomize_seed_ui
from tts_webui.utils.manage_model_state import manage_model_state
from tts_webui.decorators.gradio_dict_decorator import dictionarize
from tts_webui.decorators.decorator_apply_torch_seed import decorator_apply_torch_seed
from tts_webui.decorators.decorator_log_generation import decorator_log_generation
from tts_webui.decorators.decorator_save_metadata import decorator_save_metadata
from tts_webui.decorators.decorator_save_wav import decorator_save_wav
from tts_webui.decorators.decorator_add_base_filename import decorator_add_base_filename
from tts_webui.decorators.decorator_add_date import decorator_add_date
from tts_webui.decorators.decorator_add_model_type import decorator_add_model_type
from tts_webui.decorators.log_function_time import log_function_time
from tts_webui.extensions_loader.decorator_extensions import (
    decorator_extension_outer,
    decorator_extension_inner,
)


def extension__tts_generation_webui():
    main_ui()
    return {
        "package_name": "extension_xtts_simple",
        "name": "XTTS-Simple",
        "version": "0.1.4",
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
    Path("./data/models/xtts/base").mkdir(parents=True, exist_ok=True)
    xtts_files = [
        "vocab.json",
        "config.json",
        "dvae.path",
        "mel_stats.pth",
        "model.pth",
    ]

    for file in xtts_files:
        if not os.path.isfile(f"./data/models/xtts/base/{file}"):
            print(f"Downloading {file}")
            r = requests.get(
                f"https://huggingface.co/coqui/XTTS-v2/resolve/v2.0.2/{file}"
            )
            with open(f"./data/models/xtts/base/{file}", "wb") as f:
                f.write(r.content)


@manage_model_state("xtts_simple")
def get_xtts(model_name: str):
    from TTS.api import TTS

    download_models()
    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    print("XTTS Device: " + device)
    return TTS(
        model_path=f"./data/models/xtts/{model_name}",
        config_path=f"./data/models/xtts/{model_name}/config.json",
    ).to(device)


@decorator_extension_outer
@decorator_apply_torch_seed
@decorator_save_metadata
@decorator_save_wav
@decorator_add_model_type("xtts_simple")
@decorator_add_base_filename
@decorator_add_date
@decorator_log_generation
@decorator_extension_inner
@log_function_time
def run_xtts(
    model_name: str, voice: str, text: str, language: str, speaker: str, **kwargs
):
    tts = get_xtts(model_name)
    if not tts.is_multi_speaker or not tts.speakers or len(tts.speakers) == 0:
        speaker = None  # type: ignore

    wav = tts.tts(
        text=text,
        speaker=speaker,
        language=language,
        speaker_wav=voice,
        # emotion=None, # Only for Coqui Studio models
        # speed=None, # Only for Coqui Studio models
        split_sentences=True,
    )
    import numpy as np

    # return (tts.config.audio["output_sample_rate"], np.array(wav))  # type: ignore
    return {
        "audio_out": (tts.config.audio["output_sample_rate"], np.array(wav)), # type: ignore
    }


languages = [
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
]


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
            model_name = model_select_ui(
                [("Base", "base")],
                "xtts",
            )
            language = gr.Dropdown(
                choices=languages,
                value="en",
                label="Language",
            )
            voice = gr.Audio(
                label="Voice sample",
                type="filepath",
                sources=["upload", "microphone"],
            )

        with gr.Column():
            speaker = gr.Dropdown(
                choices=[],
                label="Speaker name (Only for multi-speaker models)",
            )
            gr.Button("Refresh speakers", variant="secondary").click(
                fn=lambda model_name: gr.Dropdown(
                    choices=get_xtts(model_name).speakers
                ),
                inputs=[model_name],
                outputs=[speaker],
                api_name="xtts_simple_refresh_speakers",
            )
            seed, randomize_seed_callback = randomize_seed_ui()
            unload_model_button("xtts_simple")
            generate_button = gr.Button(value="Generate")

    text = gr.Textbox(placeholder="Write here...")
    audio_out = gr.Audio(label="TTS result", type="filepath")

    generate_button.click(
        **randomize_seed_callback,
    ).then(
        **dictionarize(
            fn=run_xtts,
            inputs={
                model_name: "model_name",
                seed: "seed",
                text: "text",
                voice: "voice",
                language: "language",
                speaker: "speaker",
            },
            outputs={
                "audio_out": audio_out,
                "metadata": gr.JSON(visible=False),
                "folder_root": gr.Textbox(visible=False),
            },
        ),
        api_name="xtts_simple",
    )


def main():
    with gr.Blocks(title="TTS RVC UI") as interface:
        main_ui()
    interface.launch(server_name="0.0.0.0", server_port=5000, quiet=True)


if __name__ == "__main__":
    main()
