#!/usr/bin/env python3
"""Generate the RelayCrew demo voiceover with Google Text-to-Speech."""

from pathlib import Path

from gtts import gTTS

SCRIPT = (
    "Hi, This is RelayCrew. RelayCrew is an Agent Pipeline Escrow Protocol built on Arc. "
    "It solves the manual handoff problem. When you approve an agent's work, the smart contract "
    "instantly pays them and atomically activates the next agent in the exact same transaction. "
    "As required by the hackathon, this was built using Arc Studio. Here is the custom "
    "PipelineCoordinator contract and 31 passing Foundry tests. Now let's look at the live app "
    "running on Arc Mainnet. I have created a 2-stage pipeline and funded it with real USDC. "
    "Once funded, the first agent submits their work. When I approve it, Provider 1 is paid, "
    "and Stage 2 is instantly activated. If we jump over to the Arc Explorer, you can verify the "
    "transaction hash and see the internal USDC transfer. RelayCrew provides a trustless, on-chain "
    "orchestration layer for multi-agent execution. Thanks for watching!"
)

OUTPUT = Path(__file__).resolve().parent.parent / "voiceover.mp3"


def main() -> None:
    tts = gTTS(text=SCRIPT, lang="en", tld="com", slow=False)
    tts.save(str(OUTPUT))
    print(f"Wrote {OUTPUT} ({OUTPUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
