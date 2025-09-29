# Automation-Workflow-

# Workflow Automation

A powerful workflow automation platform for building AI-powered workflows with a visual interface.

## New Features - Variable Management

### Auto-Complete for Variables

We've made it much easier to work with variables in your workflow:

1. **Auto-suggestion**: As you type `{{` in any input field, a dropdown will appear showing available variables from connected nodes
2. **Variable Manager**: Click the clipboard icon in the top toolbar to see all available variables in your workflow
3. **Connection View**: Click the link icon to see a table of all connections between nodes and their corresponding variable references
4. **Dropdown Insertion**: Use the dropdown arrow in any field that supports variables to see a list of available variables

### Using Variables in Nodes

Variables allow you to reference the output of one node in another node. The syntax is:

```
{{ node_name.field }}
```

For example, to reference the text from an input node in an OpenAI prompt:

```
{{ input_0.text }}
```

Or to reference an AI model's response in another node:

```
{{ openai_0.response }}
```

### Tips for Using Variables

- Connect nodes before trying to reference their variables
- Use the Variable Manager to see all available variables
- When hovering over nodes, a tooltip shows what variables are available
- The Connection View provides a convenient way to see and copy all variable references

## Getting Started

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Open your browser to the URL displayed in the terminal

## Building Your First Workflow

1. Drag nodes from the left panel to the canvas
2. Connect nodes by dragging from one node's output handle to another node's input handle
3. Configure node settings by clicking on them
4. Use variables to pass data between nodes
5. Click "Run" to execute your workflow