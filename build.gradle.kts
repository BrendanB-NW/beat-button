plugins {
    id("base")
}

tasks.register("dev") {
    group = "application"
    description = "Start development server"
    doLast {
        exec {
            commandLine("npm", "run", "dev")
        }
    }
}

tasks.register("build") {
    group = "build"
    description = "Build the application"
    doLast {
        exec {
            commandLine("npm", "run", "build")
        }
    }
}

tasks.register("test") {
    group = "verification"
    description = "Run tests"
    doLast {
        exec {
            commandLine("npm", "test")
        }
    }
}

tasks.register("installDependencies") {
    group = "build setup"
    description = "Install npm dependencies"
    doLast {
        exec {
            commandLine("npm", "install")
        }
    }
}