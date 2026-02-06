# HelloAi

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ Your new, shiny [Nx workspace](https://nx.dev) is almost ready ✨.

[Learn more about this workspace setup and its capabilities](https://nx.dev/nx-api/next?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects) or run `npx nx graph` to visually explore what was created. Now, let's get you up to speed!

## Finish your CI setup

[Click here to finish setting up your workspace!](https://cloud.nx.app/connect/9I47cwpvx1)


## Run tasks

To run the dev server for your app, use:

```sh
npx nx dev hello-ai
```

To create a production bundle:

```sh
npx nx build hello-ai
```

To see all available targets to run for a project, run:

```sh
npx nx show project hello-ai
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/features/generate-code?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) feature.

Use the plugin's generator to create new projects.

To generate a new application, use:

```sh
npx nx g @nx/next:app demo
```

To generate a new library, use:

```sh
npx nx g @nx/react:lib mylib
```

You can use `npx nx list` to get a list of installed plugins. Then, run `npx nx list <plugin-name>` to learn about more specific capabilities of a particular plugin. Alternatively, [install Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) to browse plugins and generators in your IDE.

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)


[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/nx-api/next?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:
- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

# 🤖 Joe-bot

Joe-bot is a playful AI chat app built as a personal experiment in modern web development, AI integration, and Nx-powered workflows.

It’s intentionally opinionated, a little weird, and very much a **test project** — designed to explore:
- Nx + Next.js at scale
- OpenAI-powered chat APIs
- CI, caching, and Nx Cloud in real life
- UI iteration across desktop and mobile
- Shipping fast, fixing later 😄

![Joe-bot](apps/hello-ai/public/joe-head.png)

---

## What this app does

- 💬 A simple chat UI backed by OpenAI
- 🧠 A “Joe-style” personality layer
- ⚡ Fast local dev and CI with Nx
- ☁️ Remote caching via Nx Cloud
- 📱 Mobile-friendly (eventually…)

This is **not** production software. It’s a sandbox.

---

## Running locally

Install dependencies:

```sh
pnpm install
```

Start the app:

```sh
pnpm nx dev hello-ai
```

The app will be available at:
```
http://localhost:3000
```

---

## Environment variables

Create a `.env.local` file in `apps/hello-ai`:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

---

## Useful Nx commands

```sh
pnpm nx graph
pnpm nx affected -t lint test build
pnpm nx show project hello-ai
```

---

## Why Nx?

This project uses Nx to:
- Keep builds fast with local + remote caching
- Run only what’s affected in CI
- Make experimentation less painful

If you’re curious, check out:
👉 https://nx.dev

---

## Disclaimer

Joe-bot says dumb things on purpose.  
If it offends you, that’s a feature — not a bug.

Ship fast. Have fun. Break things.