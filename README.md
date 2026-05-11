# Local Event Finder

These repo contains tooling I use to search and displays events around me. It includes 2 components

1. **local-event-aggregator**: This tool uses scraper functions to fetch events from various sources, format, and store them in a database
2. **local-event-ui**: This is a simple React app that calls an API published by the event aggregator to get event data. It then displays the event data

## Getting Started

This project is intended to be run with Docker. To that end there is a `docker-compose.yml` available here to get it up and running.

1. Create a `.env` file based on the `.env.example`
2. Fire things up with `docker-compose up`
