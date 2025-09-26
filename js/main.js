
// --- Modal functionality ---
const authModal = document.getElementById('authModal');
const loginBtn = document.getElementById('loginBtn');
const closeBtn = document.querySelector('.close');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const loginForm = document.querySelector('.login-form');
const registerForm = document.querySelector('.register-form');

loginBtn.addEventListener('click', () => {
	authModal.style.display = 'block';
	document.body.style.overflow = 'hidden';
});

closeBtn.addEventListener('click', () => {
	authModal.style.display = 'none';
	document.body.style.overflow = 'auto';
});

window.addEventListener('click', (e) => {
	if (e.target === authModal) {
		authModal.style.display = 'none';
		document.body.style.overflow = 'auto';
	}
});

showRegister.addEventListener('click', (e) => {
	e.preventDefault();
	loginForm.classList.remove('active');
	registerForm.classList.add('active');
});

showLogin.addEventListener('click', (e) => {
	e.preventDefault();
	registerForm.classList.remove('active');
	loginForm.classList.add('active');
});

document.getElementById('loginForm').addEventListener('submit', (e) => {
	e.preventDefault();
	alert('Login functionality would be implemented here!');
});

document.getElementById('registerForm').addEventListener('submit', (e) => {
	e.preventDefault();
	alert('Registration functionality would be implemented here!');
});

// --- Smooth scrolling ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
	anchor.addEventListener('click', function (e) {
		e.preventDefault();
		const target = document.querySelector(this.getAttribute('href'));
		if (target) {
			target.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	});
});

// --- Quiz Progress Tracker ---
class QuizProgressTracker {
	constructor(totalQuestions) {
		this.totalQuestions = totalQuestions;
		this.answeredQuestions = 0;
		this.chart = null;
		this.initChart();
	}
	initChart() {
		const ctx = document.getElementById('quizProgressChart').getContext('2d');
		this.chart = new Chart(ctx, {
			type: 'doughnut',
			data: {
				labels: ['Completed', 'Remaining'],
				datasets: [{
					data: [0, 100],
					backgroundColor: ['#4ecdc4', '#e6f7ff'],
					borderWidth: 0,
					cutout: '70%',
				}]
			},
			options: {
				responsive: true,
				plugins: { legend: { display: false }, tooltip: { enabled: true } }
			}
		});
	}
	updateProgress(answered, total) {
		const percentage = Math.round((answered / total) * 100);
		this.chart.data.datasets[0].data = [percentage, 100 - percentage];
		this.chart.update();
		document.getElementById('progressPercent').innerText = `${percentage}%`;
	}
}

// --- Enhanced Beach Quiz ---
class EnhancedBeachQuiz {
	constructor() {
		this.currentQuestion = 1;
		this.totalQuestions = 5;
		this.score = 0;
		this.userAnswers = [];
		this.userId = this.getUserId();
		this.quizTracker = new QuizProgressTracker(this.totalQuestions);
		this.init();
	}
	getUserId() {
		let userId = localStorage.getItem('beachSafety_userId');
		if (!userId) {
			userId = 'user_' + Date.now();
			localStorage.setItem('beachSafety_userId', userId);
		}
		return userId;
	}
	saveProgress() {
		const progress = {
			userId: this.userId,
			score: this.score,
			answers: this.userAnswers,
			timestamp: new Date().toISOString(),
			completed: true
		};
		let allProgress = JSON.parse(localStorage.getItem('beachSafety_progress') || '[]');
		allProgress.push(progress);
		localStorage.setItem('beachSafety_progress', JSON.stringify(allProgress));
	}
	getHighScores() {
		const progress = JSON.parse(localStorage.getItem('beachSafety_progress') || '[]');
		return progress.sort((a, b) => b.score - a.score).slice(0, 5);
	}
	init() {
		this.bindEvents();
		this.updateQuestionDisplay();
		this.displayHighScores();
	}
	bindEvents() {
		document.querySelectorAll('.quiz-option').forEach(option => {
			option.addEventListener('click', (e) => {
				this.selectOption(e.target);
				this.quizTracker.updateProgress(this.currentQuestion, this.totalQuestions);
			});
		});
		document.getElementById('nextBtn').addEventListener('click', () => this.nextQuestion());
		document.getElementById('submitBtn').addEventListener('click', () => this.showResults());
		document.getElementById('restartBtn').addEventListener('click', () => this.restartQuiz());
	}
	selectOption(selectedOption) {
		const currentQuestionElement = document.querySelector(`.quiz-question[data-question="${this.currentQuestion}"]`);
		currentQuestionElement.querySelectorAll('.quiz-option').forEach(option => option.classList.remove('selected'));
		selectedOption.classList.add('selected');
		const isCorrect = selectedOption.dataset.answer === 'correct';
		this.userAnswers[this.currentQuestion - 1] = { selected: selectedOption.textContent, correct: isCorrect };
		if (this.currentQuestion < this.totalQuestions) {
			document.getElementById('nextBtn').style.display = 'block';
		} else {
			document.getElementById('submitBtn').style.display = 'block';
		}
	}
	nextQuestion() {
		document.querySelector(`.quiz-question[data-question="${this.currentQuestion}"]`).classList.remove('active');
		this.currentQuestion++;
		document.querySelector(`.quiz-question[data-question="${this.currentQuestion}"]`).classList.add('active');
		document.getElementById('nextBtn').style.display = 'none';
		this.updateQuestionDisplay();
	}
	updateQuestionDisplay() {}
	showResults() {
		this.score = this.userAnswers.filter(ans => ans.correct).length;
		this.saveProgress();
		document.querySelector(`.quiz-question[data-question="${this.currentQuestion}"]`).classList.remove('active');
		document.getElementById('submitBtn').style.display = 'none';
		const resultElement = document.getElementById('quizResult');
		const scoreDisplay = document.getElementById('scoreDisplay');
		const resultMessage = document.getElementById('resultMessage');
		scoreDisplay.textContent = `${this.score}/${this.totalQuestions}`;
		let message = '', messageClass = '';
		if (this.score === 5) {
			message = `🌊 Excellent! You're a beach safety expert!`;
			messageClass = 'success';
		} else if (this.score >= 3) {
			message = `🏖️ Good job! You have solid beach safety knowledge.`;
			messageClass = 'warning';
		} else {
			message = `📚 Keep learning! Review our safety tips and take the quiz again.`;
			messageClass = 'danger';
		}
		const highScores = this.getHighScores();
		if (highScores.length > 0) {
			message += `<br><br><strong>Your High Score: ${highScores[0].score}/${this.totalQuestions}</strong>`;
		}
		resultMessage.innerHTML = `<p style="font-size:1.2rem;margin-bottom:1rem;">${message}</p>`;
		resultElement.style.display = 'block';
		this.displayHighScores();
		resultElement.scrollIntoView({ behavior: 'smooth' });
	}
	displayHighScores() {
		const highScores = this.getHighScores();
		const scoresList = document.getElementById('scoresList');
		const highScoresSection = document.getElementById('highScores');
		if (highScores.length > 0) {
			scoresList.innerHTML = '';
			highScores.forEach((score, index) => {
				const scoreItem = document.createElement('div');
				scoreItem.className = 'score-item';
				const date = new Date(score.timestamp).toLocaleDateString();
				scoreItem.innerHTML = `<span>${index + 1}. ${score.score}/${this.totalQuestions}</span><span>${date}</span>`;
				scoresList.appendChild(scoreItem);
			});
			highScoresSection.style.display = 'block';
		} else {
			highScoresSection.style.display = 'none';
		}
	}
	restartQuiz() {
		this.currentQuestion = 1;
		this.score = 0;
		this.userAnswers = [];
		document.getElementById('quizResult').style.display = 'none';
		document.querySelectorAll('.quiz-question').forEach((q, i) => {
			q.classList.remove('active');
			if (i === 0) q.classList.add('active');
			q.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
		});
		document.getElementById('nextBtn').style.display = 'none';
		document.getElementById('submitBtn').style.display = 'none';
		this.quizTracker.updateProgress(0, this.totalQuestions);
	}
}

document.addEventListener('DOMContentLoaded', () => {
	new EnhancedBeachQuiz();
});
