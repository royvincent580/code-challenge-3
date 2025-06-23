# Blog Post Manager

A simple blog post manager web application built with vanilla JavaScript, HTML, and CSS. It allows users to view, add, edit, and delete blog posts. Data is persisted using a mock REST API powered by [json-server](https://github.com/typicode/json-server).

## Features

- View a list of all blog posts
- View detailed information for each post
- Add new blog posts with title, author, image, and content
- Edit existing posts (title and content)
- Delete posts
- Responsive and modern UI

## Project Structure

```
db.json
readme
project-folder/
  db.json
  index.html
  css/
    style.css
  src/
    index.js
```

- `db.json`: Sample data for json-server (root-level and inside `project-folder/`)
- `project-folder/index.html`: Main HTML file
- `project-folder/css/style.css`: Stylesheet
- `project-folder/src/index.js`: Main JavaScript logic

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [json-server](https://github.com/typicode/json-server) (`npm install -g json-server`)

### Setup

1. **Start the API server**

   In the project root, run:

   ```sh
   json-server --watch db.json --port 3000
   ```

   This will start a REST API at `http://localhost:3000`.

2. **Open the App**

   Open `project-folder/index.html` in your browser.

   > **Note:** For full functionality (especially image loading), you may need to run a local web server (e.g., with [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VS Code).

## Usage

- **View Posts:** Posts are listed on the left. Click a post to view details.
- **Add Post:** Fill out the form and submit to add a new post.
- **Edit Post:** Click "Edit" on a post, update the fields, and save.
- **Delete Post:** Click "Delete" on a post and confirm.

## Customization

- To change the initial posts, edit `db.json`.
- To change styling, edit `project-folder/css/style.css`.

## License

MIT

---

