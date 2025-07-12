[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=starci-lab_cifarm-containers&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=starci-lab_cifarm-containers)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=starci-lab_cifarm-containers&metric=bugs)](https://sonarcloud.io/summary/new_code?id=starci-lab_cifarm-containers)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=starci-lab_cifarm-containers&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=starci-lab_cifarm-containers)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=starci-lab_cifarm-containers&metric=coverage)](https://sonarcloud.io/summary/new_code?id=starci-lab_cifarm-containers)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=starci-lab_cifarm-containers&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=starci-lab_cifarm-containers)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=starci-lab_cifarm-containers&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=starci-lab_cifarm-containers)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=starci-lab_cifarm-containers&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=starci-lab_cifarm-containers)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=starci-lab_cifarm-containers&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=starci-lab_cifarm-containers)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=starci-lab_cifarm-containers&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=starci-lab_cifarm-containers)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=starci-lab_cifarm-containers&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=starci-lab_cifarm-containers)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=starci-lab_cifarm-containers&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=starci-lab_cifarm-containers)


# 🌾 CiFarm Backend

**CiFarm** is a GameFi farm-raid game built on Solana. This repository contains the backend server powering real-time gameplay, matchmaking, and game state coordination — built using a modern microservices architecture.

---

## ⚙️ Tech Stack

| Layer            | Tech Used                                              |
|------------------|--------------------------------------------------------|
| **Language**     | TypeScript (NestJS)                                    |
| **Architecture** | NestJS Microservices                                   |
| **Data Storage** | MongoDB (with sharding), Redis                         |
| **Message Bus**  | Apache Kafka, Redis Pub/Sub                            |
| **Search Engine**| Elasticsearch (for indexing users, farms, leaderboards)|
| **Infra / DevOps**| Kubernetes (on DigitalOcean), Terraform, AWS S3/EKS   |

---

## 🔥 Key Features

- ⚡ **Real-time gameplay** using Redis pub/sub & Kafka event streams.
- 🧠 **Modular microservices** architecture with isolated fault domains.
- 🔍 **Elasticsearch integration** for fast leaderboard/user/farm queries.
- ☁️ **Infrastructure-as-Code** via Terraform for reproducible deployment.
- 🐳 **Containerized** with Docker & deployed on Kubernetes (DigitalOcean).
- 🌐 **Scalable backend** tested with 100k+ concurrent simulated users.

---

## 🚀 Deployment

We use **Terraform** to provision infrastructure on **DigitalOcean** and **AWS**:
---

## 📊 Monitoring & Logs

- Metrics via **Prometheus + Grafana**
- Logs centralized through **ELK stack** (Elasticsearch + Logstash + Kibana)

---
## 🛡️ Security

- JWT-based authentication
- API rate-limiting at gateway level
- Secure communication between services (mTLS ready)

---
