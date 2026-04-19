#!/usr/bin/env node

/**
 * Godot Engine Blueprint Generator
 * Converts extracted API surface to FDL blueprints
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const blueprintTemplates = {
  // Core Math (ai = computational/algorithmic features)
  'vector-operations': {
    category: 'ai',
    description: '2D and 3D vector math operations',
    features: [
      { name: 'Creation', description: 'Create vectors from components' },
      { name: 'Normalization', description: 'Convert to unit vectors' },
      { name: 'Length', description: 'Calculate magnitude' },
      { name: 'Dot Product', description: 'Measure parallelism' },
      { name: 'Cross Product', description: 'Compute perpendicular normal (3D)' },
      { name: 'Interpolation', description: 'Linear and spherical blending' },
      { name: 'Clamping', description: 'Constrain components within bounds' },
    ]
  },
  'transform-operations': {
    category: 'integration',
    description: '3D and 2D spatial transforms (position, rotation, scale)',
    features: [
      { name: 'Transform Creation', description: 'Create from position, rotation, scale' },
      { name: 'Transform Composition', description: 'Combine multiple transforms' },
      { name: 'Point Transformation', description: 'Apply transform to position' },
      { name: 'Direction Transformation', description: 'Apply rotation without translation' },
      { name: 'Transform Inversion', description: 'Compute inverse transform' },
      { name: 'Interpolation', description: 'Blend between two transforms' },
    ]
  },
  'quaternion-rotations': {
    category: 'integration',
    description: 'Quaternion-based 3D rotations (gimbal-lock free)',
    features: [
      { name: 'Creation from Euler', description: 'Convert Euler angles to quaternion' },
      { name: 'Creation from Axis-Angle', description: 'Rotate by axis and angle' },
      { name: 'Quaternion Multiplication', description: 'Compose rotations' },
      { name: 'Interpolation', description: 'Smooth rotation blending (SLERP)' },
      { name: 'To Euler Conversion', description: 'Convert quaternion back to angles' },
      { name: 'Vector Rotation', description: 'Apply quaternion rotation to vector' },
    ]
  },

  // Input System
  'keyboard-input': {
    category: 'integration',
    description: 'Keyboard input capture and key state tracking',
    features: [
      { name: 'Key State Detection', description: 'Check if key is pressed' },
      { name: 'Key Events', description: 'Receive key press/release signals' },
      { name: 'Key Modifiers', description: 'Detect Shift, Ctrl, Alt, etc.' },
      { name: 'Raw Input', description: 'Access raw keyboard input' },
    ]
  },
  'mouse-input': {
    category: 'integration',
    description: 'Mouse position, button, and motion tracking',
    features: [
      { name: 'Position Tracking', description: 'Get current mouse coordinates' },
      { name: 'Button Detection', description: 'Check mouse button state' },
      { name: 'Motion Events', description: 'Receive mouse movement signals' },
      { name: 'Mouse Capture', description: 'Lock/hide mouse cursor' },
      { name: 'Scroll Wheel', description: 'Detect scroll up/down' },
    ]
  },
  'gamepad-input': {
    category: 'integration',
    description: 'Joystick/gamepad input and haptic feedback',
    features: [
      { name: 'Device Detection', description: 'Enumerate connected gamepads' },
      { name: 'Axis Input', description: 'Read analog stick/trigger values' },
      { name: 'Button Input', description: 'Detect gamepad button presses' },
      { name: 'Vibration', description: 'Send haptic feedback to device' },
      { name: 'Device Mapping', description: 'Standardized input mapping' },
    ]
  },
  'touch-input': {
    category: 'integration',
    description: 'Multi-touch and gesture input for mobile devices',
    features: [
      { name: 'Touch Detection', description: 'Detect touch screen input' },
      { name: 'Multi-touch', description: 'Handle multiple simultaneous touches' },
      { name: 'Pressure Sensitivity', description: 'Read touch pressure if supported' },
      { name: 'Drag Gestures', description: 'Detect touch drag motion' },
    ]
  },

  // File I/O
  'file-operations': {
    category: 'data',
    description: 'Cross-platform file reading and writing',
    features: [
      { name: 'File Reading', description: 'Read file contents as string or bytes' },
      { name: 'File Writing', description: 'Write data to file with overwrite protection' },
      { name: 'File Existence', description: 'Check if file exists' },
      { name: 'File Deletion', description: 'Delete file from disk' },
      { name: 'File Properties', description: 'Get file size and modification time' },
    ]
  },
  'directory-operations': {
    category: 'data',
    description: 'Directory traversal and management',
    features: [
      { name: 'Directory Listing', description: 'Enumerate files and subdirectories' },
      { name: 'Directory Creation', description: 'Create new directories' },
      { name: 'Directory Deletion', description: 'Remove empty directories' },
      { name: 'Path Resolution', description: 'Normalize and join paths' },
    ]
  },
  'compression': {
    category: 'data',
    description: 'File compression (DEFLATE, ZSTD, Brotli, Gzip)',
    features: [
      { name: 'DEFLATE Compression', description: 'Standard deflate compression' },
      { name: 'ZSTD Compression', description: 'Fast modern compression' },
      { name: 'Brotli Compression', description: 'High-ratio compression' },
      { name: 'Decompression', description: 'Decompress all supported formats' },
    ]
  },

  // Scene System
  'scene-tree-management': {
    category: 'ui',
    description: 'Hierarchical scene graph and node management',
    features: [
      { name: 'Node Creation', description: 'Instantiate new nodes' },
      { name: 'Parent-Child Relationships', description: 'Build node hierarchy' },
      { name: 'Node Naming', description: 'Name and reference nodes by path' },
      { name: 'Node Traversal', description: 'Find nodes via queries' },
      { name: 'Node Groups', description: 'Group nodes for batch operations' },
      { name: 'Scene Instantiation', description: 'Load scene files into tree' },
    ]
  },
  'node-signals': {
    category: 'ui',
    description: 'Signal emission and connection for event-driven programming',
    features: [
      { name: 'Signal Connection', description: 'Connect signals to methods' },
      { name: 'Signal Emission', description: 'Emit signals with payloads' },
      { name: 'Signal Disconnection', description: 'Remove signal connections' },
      { name: 'Custom Signals', description: 'Define app-specific signals' },
    ]
  },
  'node-process-callbacks': {
    category: 'ui',
    description: 'Per-frame update callbacks and physics processing',
    features: [
      { name: 'Process', description: 'Called every frame for logic updates' },
      { name: 'Physics Process', description: 'Called at fixed timestep for physics' },
      { name: 'Input Processing', description: 'Receive input events' },
      { name: 'Notification System', description: 'Custom lifecycle notifications' },
    ]
  },

  // Rendering
  'mesh-rendering': {
    category: 'integration',
    description: '3D mesh data structures and rendering',
    features: [
      { name: 'Mesh Creation', description: 'Create mesh from vertices/indices' },
      { name: 'Mesh Vertex Data', description: 'Define positions, normals, UVs, colors' },
      { name: 'Mesh Index Buffers', description: 'Define triangle topology' },
      { name: 'Mesh Primitives', description: 'Cube, sphere, cylinder, etc.' },
      { name: 'Mesh Morphing', description: 'Blend between mesh targets' },
    ]
  },
  'material-system': {
    category: 'integration',
    description: 'Surface properties and shader material system',
    features: [
      { name: 'Base Material Properties', description: 'Albedo, normal, metallic, roughness' },
      { name: 'Shader Materials', description: 'Custom shader-based materials' },
      { name: 'Material Parameters', description: 'Set and animate shader parameters' },
      { name: 'Transparency', description: 'Alpha blending and translucency' },
      { name: 'Special Effects', description: 'Parallax, clearcoat, anisotropy' },
    ]
  },
  'texture-system': {
    category: 'integration',
    description: 'Texture loading, filtering, and addressing modes',
    features: [
      { name: 'Texture Creation', description: 'Create from image data' },
      { name: 'Texture Loading', description: 'Load PNG, JPG, WebP, etc.' },
      { name: 'Texture Filtering', description: 'Linear, nearest, anisotropic' },
      { name: 'Texture Addressing', description: 'Wrap, clamp, mirror modes' },
      { name: 'Texture Atlasing', description: 'Pack multiple textures' },
    ]
  },
  'lighting-system': {
    category: 'integration',
    description: 'Directional, point, and spot light rendering',
    features: [
      { name: 'Directional Lights', description: 'Sun-like lights from infinity' },
      { name: 'Point Lights', description: 'Omni-directional radial lights' },
      { name: 'Spot Lights', description: 'Cone-shaped lights with falloff' },
      { name: 'Light Intensity', description: 'Control brightness' },
      { name: 'Shadow Mapping', description: 'Real-time shadow casting' },
    ]
  },

  // Physics
  'rigid-body-physics-3d': {
    category: 'integration',
    description: '3D rigid body simulation with gravity and collision',
    features: [
      { name: 'Rigid Body Creation', description: 'Dynamic bodies with mass and inertia' },
      { name: 'Linear Velocity', description: 'Set and read velocity' },
      { name: 'Angular Velocity', description: 'Set and read rotational velocity' },
      { name: 'Force Application', description: 'Apply forces at center or offset' },
      { name: 'Impulses', description: 'Apply instantaneous velocity changes' },
      { name: 'Gravity', description: 'Enable/disable gravity per body' },
      { name: 'Damping', description: 'Linear and angular drag' },
    ]
  },
  'collision-shapes': {
    category: 'integration',
    description: 'Primitive collision shapes for physics and raycasting',
    features: [
      { name: 'Box Shape', description: 'Axis-aligned bounding box' },
      { name: 'Sphere Shape', description: 'Spherical collision' },
      { name: 'Capsule Shape', description: 'Cylinder with rounded ends' },
      { name: 'Cylinder Shape', description: 'Circular extrusion' },
      { name: 'Mesh Shape', description: 'Trimesh from model data' },
      { name: 'Convex Shape', description: 'Optimized convex hull' },
    ]
  },
  'joints-constraints': {
    category: 'integration',
    description: '3D joint constraints connecting rigid bodies',
    features: [
      { name: 'Hinge Joint', description: 'Revolute joint (door hinge)' },
      { name: 'Slider Joint', description: 'Prismatic joint (piston)' },
      { name: 'Ball Joint', description: 'Spherical joint (shoulder)' },
      { name: 'Cone Twist Joint', description: 'Twist with cone limit' },
      { name: '6-DOF Joint', description: 'Full 6-axis freedom with limits' },
    ]
  },

  // Audio
  'audio-playback': {
    category: 'integration',
    description: '2D and 3D audio stream playback',
    features: [
      { name: '2D Audio', description: 'Global audio playback' },
      { name: '3D Audio', description: 'Spatialized audio with Doppler' },
      { name: 'Volume Control', description: 'Set gain and loudness' },
      { name: 'Pitch Control', description: 'Adjust playback speed' },
      { name: 'Looping', description: 'Repeat audio indefinitely' },
    ]
  },
  'audio-effects': {
    category: 'integration',
    description: 'Audio bus effects and signal processing',
    features: [
      { name: 'Bus System', description: 'Route audio through effect chains' },
      { name: 'Reverb', description: 'Space simulation effect' },
      { name: 'Filters', description: 'EQ and frequency filtering' },
      { name: 'Compressor', description: 'Dynamic range compression' },
      { name: 'Distortion', description: 'Harmonic distortion' },
    ]
  },

  // Animation
  'keyframe-animation': {
    category: 'ui',
    description: 'Timeline-based keyframe animation and playback',
    features: [
      { name: 'Animation Recording', description: 'Capture property changes' },
      { name: 'Animation Playback', description: 'Play stored animations' },
      { name: 'Animation Blending', description: 'Fade between animations' },
      { name: 'Animation Speed', description: 'Adjust playback rate' },
      { name: 'Animation Callbacks', description: 'Trigger events at keyframes' },
    ]
  },
  'animation-state-machine': {
    category: 'ui',
    description: 'State machine-based animation control',
    features: [
      { name: 'State Creation', description: 'Define animation states' },
      { name: 'Transitions', description: 'Move between states with conditions' },
      { name: 'Blend Spaces', description: '1D/2D parametric blending' },
      { name: 'State Callbacks', description: 'Execute code on state change' },
    ]
  },

  // GUI
  'button-controls': {
    category: 'ui',
    description: 'Clickable buttons and button groups',
    features: [
      { name: 'Button Creation', description: 'Text and icon buttons' },
      { name: 'Button Signals', description: 'pressed, released, toggled' },
      { name: 'Button Groups', description: 'Radio button behavior' },
      { name: 'Styling', description: 'Customize appearance' },
    ]
  },
  'text-input': {
    category: 'ui',
    description: 'Text entry fields and text editing',
    features: [
      { name: 'Single-Line Input', description: 'LineEdit widget' },
      { name: 'Multi-Line Input', description: 'TextEdit widget' },
      { name: 'Text Validation', description: 'Input filtering and constraints' },
      { name: 'Cursor Control', description: 'Move caret and select text' },
      { name: 'Copy/Paste', description: 'Clipboard integration' },
    ]
  },
  'container-layouts': {
    category: 'ui',
    description: 'Layout containers for UI arrangement',
    features: [
      { name: 'Box Container', description: 'Horizontal/vertical stacking' },
      { name: 'Grid Container', description: 'Tabular layout' },
      { name: 'Tab Container', description: 'Tabbed interface' },
      { name: 'Margin Container', description: 'Add spacing around child' },
      { name: 'Scroll Container', description: 'Scrollable content area' },
    ]
  },

  // Networking
  'peer-to-peer-networking': {
    category: 'integration',
    description: 'ENet-based multiplayer networking',
    features: [
      { name: 'Server Creation', description: 'Host a game server' },
      { name: 'Client Connection', description: 'Connect to remote host' },
      { name: 'Packet Sending', description: 'Send data to peers' },
      { name: 'Packet Receiving', description: 'Receive messages' },
      { name: 'Reliable/Unreliable', description: 'Choose delivery guarantees' },
    ]
  },
  'websocket-communication': {
    category: 'integration',
    description: 'WebSocket protocol for real-time communication',
    features: [
      { name: 'WebSocket Server', description: 'Listen for connections' },
      { name: 'WebSocket Client', description: 'Connect to server' },
      { name: 'Message Exchange', description: 'Send and receive text/binary data' },
    ]
  },

  // Scripting
  'gdscript-execution': {
    category: 'workflow',
    description: 'GDScript compilation, execution, and debugging',
    features: [
      { name: 'Script Compilation', description: 'Compile .gd to bytecode' },
      { name: 'Script Instance', description: 'Create object from script' },
      { name: 'Hot Reload', description: 'Update running scripts' },
      { name: 'Error Reporting', description: 'Compile and runtime errors' },
    ]
  },
};

function generateBlueprint(name, data) {
  const timestamp = new Date().toISOString().split('T')[0];
  const features = data.features.map((f, i) => ({
    name: f.name.replace(/\s+/g, '_').toLowerCase(),
    description: f.description,
    priority: i + 1,
  }));

  const outcomes = features.map(f => ({
    [f.name]: {
      given: [`${f.description} is requested`],
      then: [`action: transition_state\nfield: ${f.name}\nfrom: idle\nto: active`],
      result: `${f.description} completed`,
      priority: f.priority,
    }
  })).reduce((a, b) => ({ ...a, ...b }), {});

  const yaml = `# ============================================================
# ${data.description} — Feature Blueprint
# FDL v0.1.0 | Blueprint v1.0.0
# ============================================================
# Extracted from: Godot Engine
# Tech stack: C++ engine
# ============================================================

feature: ${name}
version: "1.0.0"
description: "${data.description}"
category: ${data.category}
tags: [${data.category}, godot]

actors:
  - id: game_engine
    name: "Godot Engine"
    type: system

outcomes:
${features.map(f => `  ${f.name}:
    given:
      - "${f.description} is requested"
    then:
      - action: transition_state
        field: status
        from: idle
        to: active
    result: "${f.description} completed"
    priority: ${f.priority}`).join('\n')}

rules:
  implementation:
    description: "Feature implemented in C++ engine core"
  platform_agnostic:
    description: "Works across desktop, web, mobile platforms"

related: []

extensions:
  tech_stack:
    language: "C++"
    runtime: "Godot 4.x"
`;

  return yaml;
}

function main() {
  const baseDir = path.join(__dirname, '..', 'blueprints');

  // Ensure directories exist
  const categories = ['core', 'data', 'ui', 'integration', 'workflow'];
  categories.forEach(cat => {
    const dir = path.join(baseDir, cat);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  // Generate blueprints
  let count = 0;
  Object.entries(blueprintTemplates).forEach(([name, data]) => {
    const yaml = generateBlueprint(name, data);
    const filePath = path.join(baseDir, data.category, `${name}.blueprint.yaml`);
    fs.writeFileSync(filePath, yaml);
    console.log(`✓ Generated: ${filePath}`);
    count++;
  });

  console.log(`\n✓ Generated ${count} blueprints`);
}

main();
