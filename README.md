# Spot Check
Uses the Spotify API to track users' favorite Artists' new releases

## Specification

### Elevator Pitch
Love music? The Spot Check web application is a convenient way to keep
tabs on all of your favorite artists without constantly checking for new releases.
Subscribe to Spotify artists to get the latest updates and organize your music
discovery process. Be the first to know when new music becomes available!

### Design

The UI could be something like this:
![Mockup of the three main webpages](assets/design1.jpg)

A possible database scheme for storing users and music:
![Details for implementing Users, Artists, and Albums tables](assets/design2.jpg)

### Key Features

- [ ] Secure login over HTTPS
- [ ] Add/Remove artist subscriptions
- [ ] Periodically check for artist releases via the Spotify API
- [ ] View and organize new releases
- [ ] Persistant storage of user data
- [ ] REST API for retrieving a list of user songs
- [ ] Show application operations in real time

### Technologies

- **HTML** - Provide framework for 3 pages including **Login**, **Music**, **Manage**. Links between pages.
- **CSS** - Style application for easy navigation and uniform feel.
- **JavaScript** - Enable login button (any password allowed), add datatables with placeholder data.
- **Service** - Connect to Spotify API and enable search functionality. Populate tables with artist data in memory.
- **DB** - Build database schema and create functions for storing and retrieving data. Persistently store users, artists, and albums. At this point I could create a REST API for retrieving database entries.
- **Login** - Check user input against stored users. Only allow *valid* passwords.
- **WebSocket** - Push realtime alerts for new music. Possibly display server commands and asynchronous check progress.
- **React** - Port web app to React framework.

## HTML Deliverable

Built an HTML structure for the Spot Check web app

- **Pages** - Created three HTML pages for: login, viewing new music, and managing artist subscritions
- **Links** - Navigation between pages is included in each header
- **Text** - Text provided for tables and input labels
- **Services** - Placeholder artist search in Manage page's subscription select box
- **Images** - Created a favicon
- **Login** - Username and password inputs provided. Placeholder login button links to the music page
- **Database** - Each album and artist is represented textually with dummy data representing a database
- **WebSocket** - Placeholder text representing a log of real-time server activity. Showing notification of new albums as a superscript on the 'Music' link

