-- Création des types ENUM pour les rôles, les statuts et les priorités[cite: 1]
CREATE TYPE user_role AS ENUM ('Administrateur', 'Manager', 'Développeur');[cite: 1]
CREATE TYPE task_status AS ENUM ('À faire', 'En cours', 'Terminé');[cite: 1]
CREATE TYPE task_priority AS ENUM ('Faible', 'Moyenne', 'Élevée');[cite: 1]

-- 1. Table des utilisateurs[cite: 1]
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'Développeur',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);[cite: 1]

-- 2. Table des projets[cite: 1]
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);[cite: 1]

-- 3. Table des membres des projets (relation plusieurs-à-plusieurs)[cite: 1]
CREATE TABLE project_members (
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, user_id)
);[cite: 1]

-- 4. Table des tâches (Gestion Kanban)[cite: 1]
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status task_status DEFAULT 'À faire',
    priority task_priority DEFAULT 'Moyenne',
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);[cite: 1]

-- 5. Table des documents[cite: 1]
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    uploaded_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);[cite: 1]

-- 6. Table des activités (Historique des actions)[cite: 1]
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);[cite: 1]

-- 7. Table des commentaires de tâches
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    task_id INT REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_task_id ON comments(task_id);