# Web Programming Laboratory 7 - Back-end

In a express. js backend the workflow is the following:

Request → Route → Middleware (auth) → Controller → Store → Response

### 1. Request
The **starting point**. This is the data packet sent by the client (browser or mobile app) to your server. It contains the URL, the method (GET, POST, etc.), headers, and sometimes a "body" containing information like a username or item title.

### 2. Route
The **traffic cop**. The Route’s job is to look at the incoming Request's URL and Method and decide which part of the code should handle it.
> **Example:** "If the request is a `GET` to `/items`, send it to the Items handler."

### 3. Middleware (Auth)
The **security guard**. Middleware functions run *before* the main logic. In the case of **Auth** (Authentication), it checks if the user is logged in or has a valid "token." If the user isn't authorized, the middleware stops the request immediately and sends back an error, protecting the Controller and Store.

### 4. Controller
The **brain**. The Controller contains the "Business Logic." It doesn't care about how the data is stored or how the network works; it only cares about *what* should happen. It receives the request, coordinates with the Store, and determines what data to send back.

### 5. Store (Data Access)
The **librarian**. The "Store" (also known as the Service or Repository layer) is the only part of your code that talks directly to the data source—whether that is a database or a local file like `items.json`. It handles the `fs.readFile` and `fs.writeFile` logic.

### 6. Response
The **finish line**. This is the final data packet your server sends back to the client. It includes a **Status Code** (like `200 OK` or `404 Not Found`) and the data (usually JSON). Sending the response closes the Request-Response Cycle.