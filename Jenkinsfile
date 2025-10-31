pipeline {
    agent none

    environment {
        DOCKERHUB_CREDENTIALS_ID = 'dockerhub-credentials'
        DOCKERHUB_USERNAME = 'your-dockerhub-username' // It is recommended to set this from Jenkins credentials
    }

    stages {
        stage('Lint Frontend') {
            agent {
                docker {
                    image 'node:20-slim'
                }
            }
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run lint'
                }
            }
        }

        stage('Build Images') {
            agent any
            steps {
                script {
                    docker.build("${env.DOCKERHUB_USERNAME}/frontend:latest", "-f frontend/Dockerfile.prod frontend")
                    docker.build("${env.DOCKERHUB_USERNAME}/backend:latest", "-f backend/Dockerfile.prod backend")
                    docker.build("${env.DOCKERHUB_USERNAME}/service:latest", "-f service/Dockerfile.prod service")
                }
            }
        }

        stage('Push Images to Docker Hub') {
            agent any
            steps {
                echo 'Pushing images to Docker Hub...'
                withCredentials([usernamePassword(credentialsId: env.DOCKERHUB_CREDENTIALS_ID, usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                    sh "docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}"
                    sh "docker push ${env.DOCKERHUB_USERNAME}/frontend:latest"
                    sh "docker push ${env.DOCKERHUB_USERNAME}/backend:latest"
                    sh "docker push ${env.DOCKERHUB_USERNAME}/service:latest"
                }
            }
        }

        stage('Deploy Frontend to Netlify') {
            agent {
                docker {
                    image 'node:20-slim'
                }
            }
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                    // Assumes NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID are configured in Jenkins
                    // sh 'npm install -g netlify-cli'
                    // sh 'netlify deploy --prod --dir=dist'
                    echo 'Deploying to Netlify...'
                }
            }
        }

        stage('Deploy Backend to AWS Lambda') {
            agent any // Or an agent with AWS CLI and necessary tools
            steps {
                echo 'Deploying backend to AWS Lambda...'
                // This is a placeholder. A real deployment would be more complex.
                // You might use Serverless Framework, AWS SAM, or a custom script.
                // Example with a custom script:
                // dir('backend') {
                //     sh './deploy-to-lambda.sh'
                // }
            }
        }

        stage('Deploy Service') {
            agent any
            steps {
                echo 'Deploying the service...'
                // The service appears to be a background worker.
                // You could deploy this to a container service like AWS Fargate or a small VM.
                // Example for AWS Fargate:
                // sh 'aws ecs update-service --cluster your-cluster --service your-service --force-new-deployment'
            }
        }
    }
}
