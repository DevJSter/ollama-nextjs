curl -s http://localhost:11434/api/tags 2
>/dev/null | python3 -m json.tool || echo "Ollama not accessible on port 1
1434"
{
    "models": [
        {
            "name": "mistral:latest",
            "model": "mistral:latest",
            "modified_at": "2025-06-11T11:40:22.160371116+05:30",
            "size": 4113301824,
            "digest": "f974a74358d62a017b37c6f424fcdf2744ca02926c4f952513ddf474b2fa5091",
            "details": {
                "parent_model": "",
                "format": "gguf",
                "family": "llama",
                "families": [
                    "llama"
                ],
                "parameter_size": "7.2B",
                "quantization_level": "Q4_0"
            }
        },
        {
            "name": "llama3:latest",
            "model": "llama3:latest",
            "modified_at": "2025-05-31T12:46:01.805615727+05:30",
            "size": 4661224676,
            "digest": "365c0bd3c000a25d28ddbf732fe1c6add414de7275464c4e4d1c3b5fcb5d8ad1",
            "details": {
                "parent_model": "",
                "format": "gguf",
                "family": "llama",
                "families": [
                    "llama"
                ],
                "parameter_size": "8.0B",
                "quantization_level": "Q4_0"
            }
        },
        {
            "name": "0xroyce/plutus:latest",
            "model": "0xroyce/plutus:latest",
            "modified_at": "2025-05-31T11:33:20.345534668+05:30",
            "size": 5732992741,
            "digest": "83f2e56702ad7be4e9a9ab2f1aebc267492f5fb1a858f289eb800f4713426fde",
            "details": {
                "parent_model": "",
                "format": "gguf",
                "family": "llama",
                "families": [
                    "llama"
                ],
                "parameter_size": "8.0B",
                "quantization_level": "Q5_K_M"
            }
        },
        {
            "name": "llama3.2-vision:latest",
            "model": "llama3.2-vision:latest",
            "modified_at": "2025-04-17T20:59:18.669604904+05:30",
            "size": 7901829417,
            "digest": "085a1fdae525a3804ac95416b38498099c241defd0f1efc71dcca7f63190ba3d",
            "details": {
                "parent_model": "",
                "format": "gguf",
                "family": "mllama",
                "families": [
                    "mllama",
                    "mllama"
                ],
                "parameter_size": "9.8B",
                "quantization_level": "Q4_K_M"
            }
        },
        {
            "name": "incept5/llama3.1-claude:latest",
            "model": "incept5/llama3.1-claude:latest",
            "modified_at": "2025-04-11T15:40:27.592236679+05:30",
            "size": 4661237026,
            "digest": "4ba850d59c62aec94b7725677b98342e84dc2d450a4ffa42e7b3ff60c16a729f",
            "details": {
                "parent_model": "",
                "format": "gguf",
                "family": "llama",
                "families": [
                    "llama"
                ],
                "parameter_size": "8.0B",
                "quantization_level": "Q4_0"
            }
        },
        {
            "name": "llama3.3:latest",
            "model": "llama3.3:latest",
            "modified_at": "2025-04-09T16:33:32.647325492+05:30",
            "size": 42520413916,
            "digest": "a6eb4748fd2990ad2952b2335a95a7f952d1a06119a0aa6a2df6cd052a93a3fa",
            "details": {
                "parent_model": "",
                "format": "gguf",
                "family": "llama",
                "families": [
                    "llama"
                ],
                "parameter_size": "70.6B",
                "quantization_level": "Q4_K_M"
            }
        },
        {
            "name": "llama3.2:latest",
            "model": "llama3.2:latest",
            "modified_at": "2025-04-04T13:24:02.080941005+05:30",
            "size": 2019393189,
            "digest": "a80c4f17acd55265feec403c7aef86be0c25983ab279d83f3bcd3abbcb5b8b72",
            "details": {
                "parent_model": "",
                "format": "gguf",
                "family": "llama",
                "families": [
                    "llama"
                ],
                "parameter_size": "3.2B",
                "quantization_level": "Q4_K_M"
            }
        }
    ]
}