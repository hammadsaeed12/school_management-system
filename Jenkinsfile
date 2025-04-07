pipeline {
    agent any
    environment {
        APP_NAME = "school_management-system"
        REPO_NAME = "school_management-system"
        REPO_URL = "git@github.com:hammadsaeed12/school_management-system.git"
        // DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1329384928579817513/dJIdE2afGsiQtloHfcnVJNMzOmNYypvyHsp-fKPYQ9ktHLEpGTP1JRHejfJYs0zPYZqK"
        PORT = '7000'
    }
    stages {
        stage("Git Pull or Clone") {
            steps {
                sshagent(['ssh']) {
                    echo "Pulling latest code from Git repository..."
                    sh """
                        ssh -o StrictHostKeyChecking=no ${env.SSH_USER}@${env.SSH_HOST} << ENDSSH
                        set -x

                        # Check if the development directory exists
                        if [ ! -d "/home/devxonic/development" ]; then
                            echo "Directory /home/devxonic/development does not exist. Creating it..."
                            mkdir -p "/home/devxonic/development"
                        fi

                        # Navigate to the directory (outside the if block so it always runs)
                        cd /home/devxonic/development || { echo "Failed to change directory"; exit 1; }

                        # List files to ensure we're in the right directory
                        echo 'Listing contents of development directory...';
                        ls -la;

                        # Check if the repository folder exists inside development
                        if [ ! -d '${REPO_NAME}' ]; then
                            echo 'Repository folder does not exist. Cloning repository...';
                            git clone ${REPO_URL} ${REPO_NAME};
                            cd ${REPO_NAME};
                            git switch ${env.BRANCH_NAME};
                        else
                            echo 'Repository folder exists. Checking if it is a Git repository...';
                            cd ${REPO_NAME};
    
                            # Check if it's a Git repository
                            if [ ! -d '.git' ]; then
                                echo 'Not a Git repository. Initializing repository...';
                                git init;
                                git remote add origin ${REPO_URL};
                                git fetch origin;
                                git switch ${env.BRANCH_NAME};
                            else
                                echo 'Directory is a Git repository. Pulling latest changes...';
                                git fetch origin;
                                git switch ${env.BRANCH_NAME};
                                git pull origin ${env.BRANCH_NAME};
                            fi
                        fi
                    """
                }
            }
        }
        stage("Build") {
            steps {
                sshagent(['ssh']) {
                    echo "Building the application..."
                    sh """
                        ssh -o StrictHostKeyChecking=no ${env.SSH_USER}@${env.SSH_HOST} << ENDSSH
                        set -x
                        
                        cd /home/devxonic/development/${REPO_NAME}

                        # Ensure Yarn is installed
                        if ! command -v yarn &> /dev/null; then
                            echo 'Yarn not found. Installing...'
                            sudo npm install -g yarn
                        else
                            echo 'Yarn is installed. Skipping installation...'
                            yarn --version;
                        fi

                        # Clean cache and reinstall dependencies
                        echo 'Cleaning node_modules and cache...';
                        yarn cache clean;

                        yarn install;

                        yarn build;
                    """
                }
            }
        }
        stage("Deploy") {
            steps {
                sshagent(['ssh']) {
                    echo "Deploying the application..."
                    sh """
                        ssh -o StrictHostKeyChecking=no ${env.SSH_USER}@${env.SSH_HOST} << ENDSSH
                        set -x

                        cd /home/devxonic/development/${REPO_NAME};

                        npx pm2 list | grep -w "${APP_NAME}"

                        # Check if the app is running
                        if npx pm2 list | grep -w "${APP_NAME}"
                        then
                            echo "Application ${APP_NAME} is already running. Restarting it..."
                            npx pm2 restart "${APP_NAME}"
                        else
                            echo "Application ${APP_NAME} is not running. Starting it..."
                            npx pm2 start "PORT='${PORT}' yarn run start" --name '${APP_NAME}'
                        fi

                        npx pm2 save;

                        npx pm2 list | grep -w "${APP_NAME}"

                        npx pm2 logs ${APP_NAME} --lines 5 --nostream;
                    """
                }
            }
        }
    }
    // post {
    //     success {
    //         discordSend description: "✅ Pipeline succeeded for ${APP_NAME}!", footer: "Jenkins Pipeline Notification", link: env.BUILD_URL, result: "SUCCESS", title: env.JOB_NAME, webhookURL: env.DISCORD_WEBHOOK
    //     }
    //     failure {
    //         discordSend description: "❌ Pipeline failed for ${APP_NAME}. Check logs!", footer: "Jenkins Pipeline Notification", link: env.BUILD_URL, result: "FAILURE", title: env.JOB_NAME, webhookURL: env.DISCORD_WEBHOOK
    //     }
    //     always {
    //         echo "Pipeline completed."
    //     }
    // }
}
