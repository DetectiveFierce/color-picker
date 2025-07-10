# Color Picker & Palette Manager

A sophisticated React-based color picker and palette management application built with modern web technologies. This application provides an intuitive interface for color selection, palette creation, and color scheme generation.

## Features

- **Interactive Color Selection**: Canvas-based color picker with real-time preview
- **Palette Management**: Create, edit, and organize color palettes with drag-and-drop functionality
- **Color Generation**: Generate complementary colors, shades, and random color schemes
- **Responsive Design**: Adapts to different screen sizes and devices
- **High-DPI Support**: Crisp rendering on all display types
- **Color Naming System**: Automatic generation of descriptive color names
- **Modern UI**: Smooth animations and intuitive controls

## Project Structure

### Core Application Files

- **`src/App.js`** - Simple entry point that renders the main `ColorPickerApp` component
- **`src/colorpicker.js`** - The main application component (1,457 lines) containing:
  - Complete color picker interface with canvas-based color selection
  - Palette management system with drag-and-drop functionality
  - Color generation algorithms (complementary, shades, random)
  - Resizable interface with responsive design
  - Color naming system with funny/descriptive names

### Color Picker Components

- **`src/components/ColorPicker/ColorSquare.js`** - Canvas-based color selection square:
  - Renders a 2D color space (saturation vs lightness for a given hue)
  - Interactive color picking with mouse/touch support
  - Responsive canvas that adapts to container size
  - High-DPI support for crisp rendering

- **`src/components/ColorPicker/ColorSliders.js`** - Fine-tuning controls:
  - RGB sliders with live color preview gradients
  - HSL sliders for intuitive color adjustment
  - Direct numeric input for precise values
  - Real-time color conversion and updates

### Utility Functions

- **`src/components/utils/colorUtils.js`** - Color conversion library:
  - Hex ↔ RGB ↔ HSL conversions
  - Contrast calculation for text readability
  - Color naming algorithm that generates descriptive names
  - Mathematical color space transformations

### Styling & Configuration

- **`tailwind.config.js`** - Tailwind CSS configuration with custom fonts
- **`src/ColorPicker.css`** - Custom styles for the color picker interface
- **`public/fonts/mansfield/`** - Custom font family for the application

## Getting Started


## Technologies Used

- **React 19** - Modern React with hooks and functional components
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Lucide React** - Beautiful, customizable icons
- **Canvas API** - For high-performance color rendering
- **Custom Fonts** - Mansfield font family for enhanced typography

## Usage

1. **Color Selection**: Use the color square to pick colors by clicking or dragging
2. **Fine-tuning**: Use the RGB and HSL sliders for precise color adjustment
3. **Palette Creation**: Create new palettes and add colors to them
4. **Color Generation**: Generate complementary colors, shades, or random schemes
5. **Drag & Drop**: Reorder colors within palettes by dragging them
6. **Responsive Design**: The interface adapts to different screen sizes

