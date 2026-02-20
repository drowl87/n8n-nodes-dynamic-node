![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# n8n Dynamic Node

**`n8n-nodes-dynamic-node`** lets you inject and execute *any* standard n8n node at runtime by pasting its workflow‑export JSON into a single wrapper node.

---

## Compatibility

| n8n version | Package version |
|-------------|-----------------|
| v1.x        | <= 0.3.7        |
| v2.x        | >= 0.3.8        |

## Installation

### Community Nodes (Recommended)

Your instance owner can install this node from [Community Nodes](https://docs.n8n.io/integrations/community-nodes/installation/).

1. Go to **Settings > Community Nodes**.
2. Select **Install**.
3. Enter `n8n-nodes-dynamic-node` in **Enter npm package name**.
4. Agree to the [risks](https://docs.n8n.io/integrations/community-nodes/risks/) of using community nodes: select **I understand the risks of installing unverified code from a public source**.
5. Select **Install**.

After installing the node, you can use it like any other node. n8n displays the node in search results in the **Nodes** panel.

### Manual

1. In your n8n instance directory, install from npm:

   ```bash
   npm install n8n-nodes-dynamic-node --save
   ```
2. Restart n8n.
3. You’ll now see **Dynamic Node** in the node picker.

For Docker-based deployments, add the following line before the font installation command in your [n8n Dockerfile](https://github.com/n8n-io/n8n/blob/master/docker/images/n8n/Dockerfile):

`RUN cd /usr/local/lib/node_modules/n8n && npm install n8n-nodes-dynamic-node`

---

## Usage

1. **Copy the node that you want to dynamically modify** by selecting it and pressing `Ctrl + C`.

2. **Wire up** Select `Dynamic Node` from the list of n8n nodes and wire it up to emulate your copied node.

2. **Switch the `Node JSON` field into *Expression* mode** (click **Fixed** → **Expression**).

3. **Paste your exported‑node JSON** into the editor. For example, a simple Graph API call:

    - A direct paste might look like this, which the `Dynamic Node` should still be flexible enough to parse without modifying anything:
      ```json
      {
        "nodes": [
          {
            "parameters": {
              "url": "=https://graph.microsoft.com/v1.0/users/{{ $json.id_msft }}?$select=accountEnabled,userPrincipalName,id",
              "authentication": "genericCredentialType",
              "genericAuthType": "oAuth2Api",
              "options": {}  // not required to run
            },
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4.2,  // will default to latest if not specified
            "position": [
              460,
              -520
            ],  // not required to run
            "id": "550e0f7c-8a0c-462d-948a-89556abe8e5b",  // not required to run
            "name": "Fetch Current Azure Status",
            "credentials": {
              "oAuth2Api": {
                "id": "q7iDizt7Jxoy2cKo",
                "name": "Microsoft Graph API Creds"  // not required to run
              }
            },
            "onError": "continueRegularOutput"
          }
        ],
        "connections": {  // everything below here is ignored
          "Fetch Current Azure Status": {
            "main": [
              [],
              []
            ]
          }
        },
        "pinData": {},
        "meta": {
          "templateCredsSetupCompleted": true,
          "instanceId": "j91cef9ee1e9ee17cc8d16efb7974d807be5ea0cbe8d1adfceb25249ee039v76"
        }
      }
      ```

    - You can add more expressions to parameterize any dynamic pieces and trim it down to the bare essentials:
      ```json
      {
        "parameters": {
          "url": "{{ $json.dynamic_url }}",
          "authentication": "genericCredentialType",
          "genericAuthType": "oAuth2Api"
        },
        "type": "n8n-nodes-base.httpRequest",
        "name": "Fetch Current Azure Status",
        "credentials": {
          "oAuth2Api": {
            "id": "{{ $json.dynamic_credential }}"
          }
        }
      }
      ```

4. **Click *Test step***. The node will:

   * Clone an internal **Execute Workflow Trigger → YOUR NODE** mini‑workflow.
   * Evaluate any `{{…}}` expressions (`$json`, etc.).
   * Execute the underlying node with your credentials and input items.
   * Return its output as the `Dynamic Node`’s own output.

> **Note:** More complex node options like pagination that rely on elements from `$response` don't seem to work since that is handled differently in sub-workflow/child execution contexts. You can still workaround that by doing a loop to manually handle pagination.

---

## Tips & Troubleshooting

* Always use **Expression mode** when your JSON contains `{{…}}` placeholders.
* Ensure your pasted JSON is a **true object** (no wrapping quotes).
* Double‑check that your exported node JSON includes a `name` field.
  * **Note:** The `Dynamic Node` will append on **" - Dynamic Node"** to whatever name you've specified to make sure there aren't name collisions with whatever node you originally copied.
* If you see **“Node JSON must be an object”**, switch to Expression mode and remove stray quotes.

## License

[MIT](https://github.com/drowl87/n8n-nodes-dynamic-node/blob/master/LICENSE.md)

---

Happy automating with the world’s first **Dynamic Node** for n8n! 🚀
