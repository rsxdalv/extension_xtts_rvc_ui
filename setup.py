
import setuptools

setuptools.setup(
	name="extension_xtts_simple",
    packages=setuptools.find_namespace_packages(),
	version="0.1.5",
	author="rsxdalv",
	description="XTTS-RVC-UI is a Gradio UI for XTTSv2",
	url="https://github.com/rsxdalv/extension_xtts_rvc_ui",
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
