
# **Usage**
### - Login
Enter your email and password on the login page to sign in. If the credentials are incorrect, an error message will be displayed.

Click on the "Hint" button on the login page to display the current available users (for practical purposes)

### - Home
Once authenticated, the user is redirected to the home page, which is protected by a route guard.

From here, it is possible to track your current projects, and if an admin - create new ones.

# Backend
Using Firebase Authentification, a unique ID is tied to each user - this ID is used as the document ID in the actual database to efficiently lookup whether the logged in email is an admin or not. 

Visualization:
| Document ID [Users]                  | mail  | admin             |
|--------------------------------------|-------|------------------|
| MLFmH8PmCBPhzI6EwnQ9dKUUt3I3         | jensen@mail.dk   | true   |
| 1eNuD2emCKavggVggoVaZYk2dQF2         | hansen@mail.dk | false   |



# **Tech Stack**

**Frontend:**
- Vue.js
- Tailwind CSS

**Backend:**
- Firebase Authentication

**Build Tools:**
- Vite