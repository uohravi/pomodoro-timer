# Use Node.js Alpine for a lightweight base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install a simple HTTP server
RUN npm install -g http-server

# Copy application files
COPY index.html .
COPY styles.css .
COPY script.js .
COPY database.js .
COPY unit-tests.js .
COPY tests.html .
COPY README.md .

# Create a simple start script
RUN echo '#!/bin/sh' > start.sh && \
    echo 'http-server -p 8080 -a 0.0.0.0 --cors' >> start.sh && \
    chmod +x start.sh

# Expose port 8080
EXPOSE 8080

# Set the default command
CMD ["./start.sh"] 