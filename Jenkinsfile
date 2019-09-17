def hyperdriveTriggerSlaveLabel = getHyperdriveTriggerSlaveLabel()
def toolVersionJava = getToolVersionJava()
def toolVersionMaven = getToolVersionMaven()
def toolVersionGit = getToolVersionGit()
def mavenSettingsId = getMavenSettingsId()

pipeline {
    agent {
        label "${hyperdriveTriggerSlaveLabel}"
    }
    tools {
        jdk "${toolVersionJava}"
        maven "${toolVersionMaven}"
        git "${toolVersionGit}"
    }
    options {
        buildDiscarder(logRotator(numToKeepStr: '20'))
        timestamps()
    }
    stages {
        stage ('Build') {
            steps {
                configFileProvider([configFile(fileId: "${mavenSettingsId}", variable: 'MAVEN_SETTINGS_XML')]) {
                    sh "mvn -s $MAVEN_SETTINGS_XML clean package  --no-transfer-progress"
                }
            }
        }
    }
}
