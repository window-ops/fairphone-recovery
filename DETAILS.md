# Concept Details and Inspiration

## Sources of Inspiration

- **The User Interface:** The clean, comfortable, and readable UI is inspired by the **Microsoft Surface UEFI**. Traditional Android recoveries (like TWRP or stock recovery) often rely on tiny, high-contrast monospace text or utilitarian designs that feel intimidating. This concept brings the premium, PC-like UEFI experience to a mobile form factor.
- **UEFI & Coreboot Concept:** The overarching idea of unlocking a true UEFI environment on the phone after flashing coreboot is inspired by **Tianocore EDK II**.
- **MOK Manager:** The Machine Owner Key management section is directly inspired by the Linux MOK manager that can be installed on Surface devices to handle custom Secure Boot keys.
- **The "Homebrew" Feature:** The core concept is inspired from console modding. The name "Homebrew" is inspired by **The Homebrew Channel**, a program that can be installed on the Nintendo Wii to run custom, unsigned code directly from an SD card.

---

## Technical Concept: `autorun.hbf`

In this hypothetical environment, `autorun.hbf` (Homebrew Binary Format) is a bare-metal executable payload stored on an external USB drive. 

When the user clicks "Run from RAM", the recovery environment maps this binary into memory and passes execution to the payload.

To allow the payload (like a port of DOOM) to display graphics without needing a complex Linux display driver, the recovery passes a "handoff structure". Because the minimal Cairo renderer cannot gracefully release the phone's built-in MIPI-DSI panel, this structure provides the physical address of an external monitor's framebuffer, negotiated via DisplayPort Alt-Mode on a connected USB-C dock.

### Sample `autorun.hbf` Entry Point

Here is a conceptual example of what the entry point of the DOOM `autorun.hbf` payload might look like when compiled. It receives the hardware state from the recovery and starts drawing directly to the external screen.

```c
#include <stdint.h>

// The recovery environment passes this struct in register x0
// before jumping to the payload's entry point.
typedef struct {
    uint32_t magic;           // 0x48425257 ("HBRW")
    uint32_t version;
    uint32_t *framebuffer;    // Physical address of the screen buffer
    uint32_t width;
    uint32_t height;
    uint32_t pitch;           // Bytes per row
    uint32_t bpp;             // Bits per pixel (e.g., 32)
    void *usb_hid_context;    // Pointer to polled USB HID state for docking
} recovery_handoff_t;

// DOOM engine entry point
extern void d_main(void);
extern void update_screen(uint32_t *fb, uint32_t width, uint32_t height);

// Global pointer to the framebuffer for the rendering engine to use
static uint32_t *global_fb = NULL;

/* 
 * Payload Entry Point
 * The recovery does a Branch Register (BR) to this address.
 */
void __attribute__((naked, section(".init"))) _start(recovery_handoff_t *handoff) {
    // 1. Setup the stack pointer in safe RAM 
    // (Assuming the recovery allocated a stack for us)
    __asm__ volatile (
        "mov sp, x1 \n"   // x1 contains the stack top provided by recovery
    );

    // 2. Validate the handoff structure
    if (handoff && handoff->magic == 0x48425257) {
        global_fb = handoff->framebuffer;
        
        // 3. Clear the screen (paint it black)
        for (uint32_t i = 0; i < (handoff->height * handoff->pitch / 4); i++) {
            global_fb[i] = 0x00000000;
        }

        // 4. Start the DOOM engine
        // DOOM's internal renderer will now write pixel data to global_fb
        d_main();
    }

    // 5. If the program exits, spin infinitely or trigger a hardware reboot
    while (1) {
        __asm__ volatile ("wfi"); // Wait for interrupt
    }
}
```

### How it works:
1. **No OS Overhead:** DOOM is running completely bare-metal in volatile RAM. There is no Android system, no background processes, and no filesystem access (other than the external USB drive).
2. **Direct Rendering:** Because the recovery environment already initialized the smartphone's display panel (which requires complex MIPI-DSI initialization sequences), DOOM simply overwrites the memory addresses pointed to by `handoff->framebuffer`. The display controller automatically pushes those pixels to the screen.
3. **Volatile:** The moment the phone is rebooted or loses power, the RAM is cleared, leaving the host smartphone completely untouched.
