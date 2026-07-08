# Fairphone Recovery Concept

Note: AI has been involved in automating most parts of this personal project.

This project is a hypothetical, interactive concept exploring what it would look like if the Fairphone (or any open, enthusiast-friendly smartphone) shipped with a truly user-friendly, feature-rich recovery environment out of the box.

Unlike typical Android recovery screens that are purely text-based, hidden behind button combos, and heavily restricted, this concept imagines a rich, accessible interface designed for right to repair, software freedom, and hardware ownership.

## Features

- Custom ROM Flashing: A straightforward interface for browsing and installing custom operating systems without needing a PC or command-line tools.
- Coreboot Integration: A simulated flow for replacing the proprietary stock firmware/bootloader with `coreboot`, giving users full control over the lowest levels of their hardware.
- Permanent Rooting: A one-click rooting solution built directly into the recovery, automatically backing up the `pre-root` state.
- Homebrew & RAM Booting: A "Homebrew" loader that allows booting alternative payloads (like DOOM) entirely in volatile RAM from external media, complete with docking support (Video, Serial, USB HID).
- Interactive Shell: A built-in terminal emulator to run recovery commands (like `ls`, `mount`, `getprop`, and `fastboot` variables) directly on the device.
- Hardware Button Navigation: Full support for standard recovery navigation. Use the Volume Up / Volume Down keys (mapped to `ArrowUp` and `ArrowDown` on a keyboard) to move the focus, and the Power button (mapped to `Enter`) to select, or navigate entirely by touch.

## Why Fairphone?

The Fairphone is well-known for its modularity and repairability. This project explores the software side of that philosophy: true ownership means having full, user-friendly control over the software stack, from the bootloader to the operating system, without voiding warranties or jumping through unnecessary technical hoops.

## Development

This is a web-based UI mockup built using HTML, CSS, and JavaScript. It does not actually flash any physical devices. 

- State Management: Uses a custom router and UI component system.
- Input Handling: Custom navigation logic allows seamless switching between pointer/touch input and hardware button navigation.
- Styling: Custom CSS tailored to look like a modern, utilitarian recovery environment.

### Running Locally

This is a static web application that uses JavaScript imports, so you may need to start the server before opening `index.html`.

```bash
# Example using Python's built-in HTTP server
python3 -m http.server 8000
```
Then navigate to `http://localhost:8000` in your browser.