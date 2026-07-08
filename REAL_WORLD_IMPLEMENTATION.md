# Real-World Implementation Architecture

This document outlines how the concepts mocked in this web-based UI would be implemented in a real-world smartphone recovery environment running on bare-metal or a minimal Linux kernel.

## Core Technology Stack

In a real-world scenario, a smartphone recovery is essentially a minimal operating system living in a dedicated partition (or ramdisk). To achieve the rich graphical environment and low-level access demonstrated in this concept:

- **Kernel:** A stripped-down Linux kernel (e.g., standard Android Linux kernel fork) providing hardware drivers (display, touch, USB, eMMC/UFS storage).
- **Core Logic:** Written in **C** for memory efficiency and speed, with critical low-level initialization and payload handoffs written in **ARM64 Assembly**.
- **Graphics Pipeline:** Instead of Android's heavy SurfaceFlinger, the UI would be rendered directly to the DRM/KMS (Direct Rendering Manager) buffer or legacy `/dev/fb0` framebuffer.
- **Rendering Engine:** A minimal fork of **Cairo** (from freedesktop.org), compiled statically, would handle 2D vector drawing, text rendering (via FreeType), and UI component compositing.
- **Input Handling:** Raw evdev events read directly from `/dev/input/eventX` for touchscreen coordinates and physical GPIO-mapped hardware buttons (Volume Up/Down, Power).

---

## Feature Implementations

### 1. The Graphical User Interface (GUI)
The web concepts (DOM, CSS) would map to a custom, lightweight C-based UI framework built over Cairo.
- **Layouts:** A simple bounding-box layout engine handles the placement of "cards", "buttons", and "switches".
- **Hardware Navigation:** The `input.js` logic translates to an event loop polling the `evdev` nodes. Pressing Volume Down increments an internal index, highlighting the target UI struct. Pressing the Power button triggers the callback pointer associated with that struct.
- **On-Screen Keyboard:** A matrix of virtual keys rendered by Cairo, injecting synthetic keycodes into the internal event queue when touched.

### 2. Flashing Coreboot
Replacing the proprietary bootloader (ABL/XBL/secure boot chains) with `coreboot`.
- **Implementation:** The recovery environment runs as `root` and accesses the raw flash memory block devices (`/dev/block/by-name/abl`, `xbl`, etc., or directly via SPI flash nodes).
- **Safety & Backups:** Before flashing, `dd` (or custom block-read C routines) copies the raw bits of the existing bootloader chain to a safe file on the `nand` partition, a special chip.
- **Flashing:** The coreboot payload is written bit-by-bit to the flash. Since modern SoCs have complex boot chains, this involves signing the payload with a key the SoC ROM accepts (e.g., an unlocked Fairphone state), replacing the entire chain or simply deleting all data and chains (which is what the mockup does).

### 3. Permanent Rooting
Modifying the system to grant `su` privileges natively.
- **Implementation:** The recovery opens `/dev/block/by-name/boot` and reads the boot image into RAM.
- **Processing:** Using routines similar to `magiskboot`, the C program parses the Android Boot Image header, decompresses the ramdisk (cpio/gzip/lz4), injects the `su` binary and necessary SELinux policy patches (`sepolicy`), recompresses it, and writes the modified image back to the boot block device.
- **Verification:** Calculates the new sha256 hashes required for Android Verified Boot (AVB) to ensure the device doesn't hard-brick.

### 4. Homebrew & RAM Booting (Payload Handoff)
Executing foreign code (like DOOM) entirely from volatile RAM.
- **Implementation:** The recovery detects external USB-OTG media by listening to `netlink` uevents and mounts the FAT32/ext4 filesystem.
- **Loading:** The `autorun.hbf` executable is mapped into physical memory using `mmap()`.
- **Handoff (Assembly):** The recovery flushes caches and prepares a standard register state. An ARM64 `BR` (branch register) instruction jumps execution to the loaded payload's entry point.
- **Graphics Limitation (No Internal Handoff):** The minimal Cairo rendering stack tightly couples with the DRM/KMS subsystem to keep the UI lightweight. Because of this, it cannot gracefully release the built-in smartphone display panel (which requires complex MIPI-DSI initialization) to a foreign payload. Consequently, the payload cannot draw to the phone's internal screen.
- **Docking Support & I/O Expansion:** To actually see and interact with the payload, "Docking Support" must be used. Since the Fairphone has only a single USB-C port, this requires plugging in a USB-C Hub/Dock. The recovery negotiates DisplayPort Alt-Mode over the USB-C connection to route video to an external monitor, and passes that external framebuffer's address to the payload. Simultaneously, the hub breaks out the connection into standard USB-A ports for HID keyboards/mice, and allows specialized USB-to-Serial or USB-to-Parallel adapters for legacy peripherals and debugging.

### 5. Interactive Shell
A functional terminal built into the recovery UI.
- **Implementation:** The UI allocates a pseudo-terminal (PTY) pair via `posix_openpt()`. 
- **Backend:** A background thread spawns a minimal shell (like `ash` from BusyBox or Toybox) connected to the PTY. 
- **Frontend:** The minimal Cairo renderer reads standard output from the PTY descriptor, handles basic ANSI escape sequences (for colors and line breaks), and renders the text to the log view. Virtual keyboard input is written to the PTY's standard input.
