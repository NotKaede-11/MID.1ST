class GradeCalculator {
    constructor() {
        this.initializeElements();
        this.addEventListeners();
        this.initializeThemeToggle();
        this.initializeBackground();
    }

    initializeElements() {
        this.subjectTabs = document.querySelectorAll('.subject-tab');
        this.calculatorForms = document.querySelectorAll('.calculator-form');
        this.resultsPanel = document.getElementById('results');
        this.themeToggleBtn = document.getElementById('themeToggle');
        this.inputs = document.querySelectorAll('input[type="number"]');
    }

    addEventListeners() {
        this.subjectTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchSubject(tab.dataset.subject));
        });

        this.calculatorForms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleCalculation(e));
        });

        this.inputs.forEach(input => {
            input.addEventListener('input', (e) => this.validateInput(e.target));
        });
    }

    validateInput(input) {
        const max = parseFloat(input.getAttribute('max'));
        const value = parseFloat(input.value);
        const errorMessage = input.nextElementSibling;
        
        if (max && value > max) {
            errorMessage.textContent = `Only ${max} points are allowed in this section`;
            errorMessage.style.display = 'block';
        } else {
            errorMessage.style.display = 'none';
        }
    }

    switchSubject(subject) {
        this.subjectTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.subject === subject);
        });
        this.calculatorForms.forEach(form => {
            form.style.display = form.dataset.subject === subject ? 'block' : 'none';
        });
        this.resultsPanel.innerHTML = '';
    }

    initializeThemeToggle() {
        if (!this.themeToggleBtn) return;
        
        this.themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            const icon = this.themeToggleBtn.querySelector('i');
            if (icon) {
                icon.className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            }
            
            document.body.style.display = 'none';
            document.body.offsetHeight; 
            document.body.style.display = '';
        });
    }

    initializeBackground() {
        const canvas = document.getElementById('particle-canvas');
        const ctx = canvas.getContext ? canvas.getContext('2d') : null;
        
        if (!ctx) return;
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const particles = [];
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 5 + 1,
                color: `rgba(143, 127, 184, ${Math.random() * 0.5 + 0.1})`,
                speedX: Math.random() * 2 - 1,
                speedY: Math.random() * 2 - 1
            });
        }
        
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.fill();
                
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                
                if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
            });
            
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 150) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(143, 127, 184, ${0.1 - distance/1500})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            
            requestAnimationFrame(draw);
        }
        
        draw();
        
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    calculateLectureGrade(data) {
        data.prelimExam = Math.min(parseFloat(data.prelimExam), 100);
        data.essay = Math.min(parseFloat(data.essay), 100);
        data.pvm = Math.min(parseFloat(data.pvm), 60);
        data.javaBasics = Math.min(parseFloat(data.javaBasics), 40);
        data.introJs = Math.min(parseFloat(data.introJs), 40);

        // New calculation for quizzes - percentage per quiz then average
        const essayPercentage = (data.essay / 100) * 100;
        const pvmPercentage = (data.pvm / 60) * 100;
        const javaBasicsPercentage = (data.javaBasics / 40) * 100;
        const introJsPercentage = (data.introJs / 40) * 100;
        
        const quizPercentage = (essayPercentage + pvmPercentage + javaBasicsPercentage + introJsPercentage) / 4;
        
        const attendance = Math.max(0, 100 - (data.absences * 10));
        const classStanding = (0.6 * quizPercentage) + (0.4 * attendance);
        const prelimGrade = (0.6 * data.prelimExam) + (0.4 * classStanding);
        
        return {
            essayPercentage,
            pvmPercentage,
            javaBasicsPercentage,
            introJsPercentage,
            quizPercentage,
            attendance,
            classStanding,
            prelimGrade,
            failed: data.absences >= 4 || prelimGrade < 75,
            // Store original values for showing calculations
            rawScores: {
                prelimExam: data.prelimExam,
                essay: data.essay,
                pvm: data.pvm,
                javaBasics: data.javaBasics,
                introJs: data.introJs,
                absences: data.absences
            }
        };
    }

    calculateLabGrade(data) {
        data.java1 = Math.min(parseFloat(data.java1), 100);
        data.java2 = Math.min(parseFloat(data.java2), 100);
        data.js1 = Math.min(parseFloat(data.js1), 100);
        data.js2 = Math.min(parseFloat(data.js2), 100);
        data.mp1 = Math.min(parseFloat(data.mp1), 100);
        data.mp2 = Math.min(parseFloat(data.mp2), 100);
        data.mp3 = Math.min(parseFloat(data.mp3), 100);
        data.mp3Docu = Math.min(parseFloat(data.mp3Docu), 100);

        const prelimExam = (0.2 * data.java1) + (0.3 * data.java2) + 
                         (0.2 * data.js1) + (0.3 * data.js2);

        const labPointsEarned = data.mp1 + data.mp2 + data.mp3 + data.mp3Docu;
        const maxLabPoints = 400; 
        const labWorkPercentage = (labPointsEarned / maxLabPoints) * 100;
        
        const attendance = Math.max(0, 100 - (data.absences * 10));
        const classStanding = (0.6 * labWorkPercentage) + (0.4 * attendance);
        const prelimGrade = (0.6 * prelimExam) + (0.4 * classStanding);
        
        return {
            prelimExam,
            labPointsEarned,
            maxLabPoints,
            labWorkPercentage,
            attendance,
            classStanding,
            prelimGrade,
            failed: data.absences >= 4 || prelimGrade < 75,
            rawScores: {
                java1: data.java1,
                java2: data.java2,
                js1: data.js1,
                js2: data.js2,
                mp1: data.mp1,
                mp2: data.mp2,
                mp3: data.mp3,
                mp3Docu: data.mp3Docu,
                absences: data.absences
            }
        };
    }

    // Update handleCalculation method to count absences from checkboxes
    async handleCalculation(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Count absences from attendance checkboxes
        const attendanceBoxes = form.querySelectorAll('input[type="checkbox"][name^="attendance-"]');
        const totalDays = attendanceBoxes.length;
        let presentDays = 0;
        
        attendanceBoxes.forEach(box => {
            if (box.checked) {
                presentDays++;
            }
        });
        
        // Number of absences is total days minus present days
        data.absences = totalDays - presentDays;
        
        let isValid = true;
        form.querySelectorAll('input[type="number"]').forEach(input => {
            this.validateInput(input);
            if (input.nextElementSibling.style.display === 'block') {
                isValid = false;
            }
        });
        
        if (!isValid) return;
        
        this.resultsPanel.innerHTML = `
            <div class="loading-animation">
                <div class="spinner"></div>
                <p>Calculating grades...</p>
            </div>
        `;

        await new Promise(resolve => setTimeout(resolve, 1000));
        const results = form.dataset.subject === 'lecture' ? 
            this.calculateLectureGrade(data) : 
            this.calculateLabGrade(data);
        this.displayResults(results, form.dataset.subject);
    }

    displayResults(results, subject) {
        const failedDueToAbsences = results.failed && results.prelimGrade >= 75;
        
        let html = `
            <h2 class="results-title">Grade Calculation Results</h2>
            ${failedDueToAbsences ? '<div class="failure-notice">FAILED DUE TO EXCESSIVE ABSENCES</div>' : ''}
        `;

        if (subject === 'lecture') {
            const attendanceDates = ['January 27', 'February 3', 'February 10', 'February 17'];
            const missedDates = [];
            const form = document.querySelector(`.calculator-form[data-subject="${subject}"]`);
            
            attendanceDates.forEach((date, index) => {
                const checkbox = form.querySelector(`input[name="attendance-${date.toLowerCase().replace(' ', '')}"]`);
                if (checkbox && !checkbox.checked) {
                    missedDates.push(date);
                }
            });
            
            const missedDaysText = missedDates.length > 0 ? 
                `Missed days: ${missedDates.join(', ')}` : 
                'No absences';

            html += `
                <div class="computation-details">
                    <h3>Detailed Computation</h3>
                    
                    <div class="computation-section">
                        <h4>Quiz Percentages</h4>
                        <p>Essay: ${results.rawScores.essay} / 100 * 100 = ${results.essayPercentage.toFixed(2)}%</p>
                        <p>PVM: ${results.rawScores.pvm} / 60 * 100 = ${results.pvmPercentage.toFixed(2)}%</p>
                        <p>Java Basics: ${results.rawScores.javaBasics} / 40 * 100 = ${results.javaBasicsPercentage.toFixed(2)}%</p>
                        <p>Intro JS: ${results.rawScores.introJs} / 40 * 100 = ${results.introJsPercentage.toFixed(2)}%</p>
                        <p>Quiz Average: (${results.essayPercentage.toFixed(2)}% + ${results.pvmPercentage.toFixed(2)}% + ${results.javaBasicsPercentage.toFixed(2)}% + ${results.introJsPercentage.toFixed(2)}%) / 4 = ${results.quizPercentage.toFixed(2)}%</p>
                    </div>
                    
                    <div class="computation-section">
                        <h4>Attendance</h4>
                        <p>100 - (${results.rawScores.absences} absences * 10) = ${results.attendance.toFixed(2)}%</p>
                        <p class="missed-days">${missedDaysText}</p>
                    </div>
                    
                    <div class="computation-section">
                        <h4>Class Standing</h4>
                        <p>(0.6 * ${results.quizPercentage.toFixed(2)}%) + (0.4 * ${results.attendance.toFixed(2)}%) = ${results.classStanding.toFixed(2)}</p>
                    </div>
                    
                    <div class="computation-section">
                        <h4>Final Prelim Grade</h4>
                        <p>(0.6 * ${results.rawScores.prelimExam}) + (0.4 * ${results.classStanding.toFixed(2)}) = ${results.prelimGrade.toFixed(2)}</p>
                    </div>
                </div>

                <div class="result-item">
                    <span>Quiz Percentage:</span>
                    <span>${results.quizPercentage.toFixed(2)}%</span>
                </div>
                <div class="result-item">
                    <span>Attendance:</span>
                    <span>${results.attendance.toFixed(2)}%</span>
                </div>
                <div class="result-item">
                    <span>Class Standing:</span>
                    <span>${results.classStanding.toFixed(2)}</span>
                </div>
                <div class="result-item final">
                    <span>Final Prelim Grade:</span>
                    <span>${results.prelimGrade.toFixed(2)}</span>
                </div>
            `;
        } else {
            const attendanceDates = ['January 27', 'February 3', 'February 10', 'February 17'];
            const missedDates = [];
            const form = document.querySelector(`.calculator-form[data-subject="${subject}"]`);
            
            attendanceDates.forEach((date, index) => {
                const checkbox = form.querySelector(`input[name="attendance-${date.toLowerCase().replace(' ', '')}"]`);
                if (checkbox && !checkbox.checked) {
                    missedDates.push(date);
                }
            });
            
            const missedDaysText = missedDates.length > 0 ? 
                `Missed days: ${missedDates.join(', ')}` : 
                'No absences';

            // Add similar detailed computation for lab grade
            html += `
                <div class="computation-details">
                    <h3>Detailed Computation</h3>
                    
                    <div class="computation-section">
                        <h4>Prelim Exam</h4>
                        <p>(0.2 * ${results.rawScores?.java1 || 0}) + (0.3 * ${results.rawScores?.java2 || 0}) + (0.2 * ${results.rawScores?.js1 || 0}) + (0.3 * ${results.rawScores?.js2 || 0}) = ${results.prelimExam.toFixed(2)}</p>
                    </div>
                    
                    <div class="computation-section">
                        <h4>Lab Work Percentage</h4>
                        <p>(${results.labPointsEarned.toFixed(2)} / ${results.maxLabPoints}) * 100 = ${results.labWorkPercentage.toFixed(2)}%</p>
                    </div>
                    
                    <div class="computation-section">
                        <h4>Attendance</h4>
                        <p>100 - (${results.rawScores?.absences || 0} absences * 10) = ${results.attendance.toFixed(2)}%</p>
                        <p class="missed-days">${missedDaysText}</p>
                    </div>
                    
                    <div class="computation-section">
                        <h4>Class Standing</h4>
                        <p>(0.6 * ${results.labWorkPercentage.toFixed(2)}) + (0.4 * ${results.attendance.toFixed(2)}) = ${results.classStanding.toFixed(2)}</p>
                    </div>
                    
                    <div class="computation-section">
                        <h4>Final Prelim Grade</h4>
                        <p>(0.6 * ${results.prelimExam.toFixed(2)}) + (0.4 * ${results.classStanding.toFixed(2)}) = ${results.prelimGrade.toFixed(2)}</p>
                    </div>
                </div>

                <div class="result-item">
                    <span>Prelim Exam:</span>
                    <span>${results.prelimExam.toFixed(2)}</span>
                </div>
                <div class="result-item">
                    <span>Lab Points:</span>
                    <span>${results.labPointsEarned.toFixed(2)} / ${results.maxLabPoints}</span>
                </div>
                <div class="result-item">
                    <span>Lab Percentage:</span>
                    <span>${results.labWorkPercentage.toFixed(2)}%</span>
                </div>
                <div class="result-item">
                    <span>Attendance:</span>
                    <span>${results.attendance.toFixed(2)}%</span>
                </div>
                <div class="result-item">
                    <span>Class Standing:</span>
                    <span>${results.classStanding.toFixed(2)}</span>
                </div>
                <div class="result-item final">
                    <span>Final Prelim Grade:</span>
                    <span>${results.prelimGrade.toFixed(2)}</span>
                </div>
            `;
        }

        if (!failedDueToAbsences) {
            html += `
                <div class="grade-status ${results.prelimGrade >= 75 ? 'passed' : 'failed'}">
                    ${results.prelimGrade >= 75 ? 'PASSED' : 'FAILED'}
                </div>
            `;
        }
        this.resultsPanel.innerHTML = html;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const backgroundElement = document.getElementById('background-animation');
    if (backgroundElement) {
        const canvas = document.createElement('canvas');
        canvas.id = 'particle-canvas';
        backgroundElement.appendChild(canvas);
    }

    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
        const icon = themeToggleBtn.querySelector('i');
        if (icon) {
            icon.className = savedTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    new GradeCalculator();
});