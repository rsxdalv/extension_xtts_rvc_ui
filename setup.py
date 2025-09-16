
import setuptools

setuptools.setup(
	name="tts_webui_extension.xtts_simple",
    packages=setuptools.find_namespace_packages(),
	version="0.1.6",
	author="rsxdalv",
	description="XTTS-RVC-UI is a Gradio UI for XTTSv2",
	url="https://github.com/rsxdalv/tts_webui_extension.xtts_rvc_ui",
    project_urls={},
    scripts=[],
    install_requires=[
        "coqui-tts",
    ],
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
)

