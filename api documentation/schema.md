CREATE TABLE event_games_with_slots (
  id SERIAL PRIMARY KEY,  -- Use SERIAL for auto-incrementing in PostgreSQL
  event_id INTEGER NOT NULL,
  game_id INTEGER NOT NULL,  -- Referring to baby_games table
  custom_title VARCHAR(255),
  custom_description TEXT,
  custom_price DECIMAL(10, 2),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_price DECIMAL(10, 2),
  max_participants INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Automatically set the current timestamp when row is created
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Automatically set the current timestamp when row is created
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (game_id) REFERENCES baby_games(id)  -- Changed reference from games to baby_games
);


CREATE TABLE events (
  id SERIAL PRIMARY KEY,  -- Use SERIAL for auto-incrementing in PostgreSQL
  title VARCHAR(255) NOT NULL,
  description TEXT,
  city_id INT NOT NULL,  -- Assuming city_id is an INT, update accordingly if it's not
  venue_id INT NOT NULL,  -- Assuming venue_id is an INT, update accordingly if it's not
  event_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'Draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Created at timestamp
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Updated at timestamp
  FOREIGN KEY (city_id) REFERENCES cities(id),
  FOREIGN KEY (venue_id) REFERENCES venues(id)
);





CREATE TABLE baby_games (
  id SERIAL PRIMARY KEY,
  game_name VARCHAR(255) NOT NULL,
  description TEXT,
  min_age INT,
  max_age INT,
  duration_minutes INT,
  categories TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  city_name VARCHAR(255) NOT NULL,
  state VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE venues (
  id SERIAL PRIMARY KEY,
  venue_name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city_id INT NOT NULL,
  capacity INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id) REFERENCES cities(id)
);


CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  city_id INT NOT NULL,
  venue_id INT NOT NULL,
  event_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'Draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id) REFERENCES cities(id),
  FOREIGN KEY (venue_id) REFERENCES venues(id)
);


CREATE TABLE event_games_with_slots (
  id SERIAL PRIMARY KEY,
  event_id INT NOT NULL,
  game_id INT NOT NULL,
  custom_title VARCHAR(255),
  custom_description TEXT,
  custom_price DECIMAL(10, 2),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_price DECIMAL(10, 2),
  max_participants INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (game_id) REFERENCES baby_games(id)
);



CREATE TABLE employee (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    qualification VARCHAR(255) NOT NULL,
    work_exp VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    father_name VARCHAR(255) NOT NULL,
    mother_name VARCHAR(255) NOT NULL,
    contact_no VARCHAR(255) NOT NULL,
    emeregency_contact_no VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    marital_status VARCHAR(255) NOT NULL,
    date_of_joining DATE NOT NULL,
    date_of_leaving DATE,
    local_address VARCHAR(255) NOT NULL,
    permanent_address VARCHAR(255) NOT NULL,
    note TEXT,
    image VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    gender VARCHAR(255) NOT NULL,
    acount_title VARCHAR(255) NOT NULL,
    bank_account_no VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    ifsc_code VARCHAR(255) NOT NULL,
    bank_branch VARCHAR(255) NOT NULL,
    payscale VARCHAR(255) NOT NULL,
    basic_salary VARCHAR(255) NOT NULL,
    epf_no VARCHAR(255) NOT NULL,
    contract_type VARCHAR(255) NOT NULL,
    shift varchar(255) NOT NULL,
    location varchar(255) NOT NULL,
    resume varchar(255) NOT NULL,
    joining_letter varchar(255) NOT NULL,
    resignation_letter varchar(255) NOT NULL,
    other_document_name varchar(255) NOT NULL,
    other_document_file varchar(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_superadmin BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    
);




