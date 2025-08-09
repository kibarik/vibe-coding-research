FROM php:8.2-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-install zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy composer files
COPY composer.json composer.lock* ./

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Copy application code
COPY . .

# Create storage directories with proper permissions
RUN mkdir -p storage/logs storage/cache && \
    chmod -R 755 storage && \
    chown -R www-data:www-data storage

# Expose port
EXPOSE 8000

# Start development server
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
