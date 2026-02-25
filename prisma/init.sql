# SQL to create database and user (run manually in PostgreSQL)

CREATE USER agendamento_user WITH PASSWORD 'agendamento_password';
CREATE DATABASE agendamento_db OWNER agendamento_user;

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE agendamento_db TO agendamento_user;
