        function generateParticipants() {
            const playersText = document.getElementById('expense-players').value;
            if (!playersText) {
                alert('请输入参与人员');
                return;
            }

            // Split players into array and filter out empty lines
            const players = playersText.split('\n').filter(p => p.trim() !== '');

            // Generate checkboxes for participants
            const participantsContainer = document.getElementById('participants-list');
            participantsContainer.innerHTML = '';

            players.forEach((player, index) => {
                const checkboxId = `participant-${index}`;
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = checkboxId;
                checkbox.className = 'participant-checkbox';
                checkbox.value = player;
                checkbox.checked = true;

                const label = document.createElement('label');
                label.htmlFor = checkboxId;
                label.className = 'participant-label';
                label.textContent = player;

                participantsContainer.appendChild(checkbox);
                participantsContainer.appendChild(label);
            });
        }

        function clearExpenseResult() {
            document.getElementById('expense-result').style.display = 'none';
            document.getElementById('total-amount').value = '';
        }

        function calculateExpense() {
            const expenseType = document.getElementById('expense-type').value;
            const totalAmount = parseFloat(document.getElementById('total-amount').value);
            const checkboxes = document.querySelectorAll('.participant-checkbox:checked');

            if (isNaN(totalAmount) || totalAmount <= 0) {
                alert('请输入有效的总金额');
                return;
            }

            if (checkboxes.length === 0) {
                alert('请选择参与人员');
                return;
            }

            // Calculate per person cost
            const perPerson = totalAmount / checkboxes.length;
            const participants = Array.from(checkboxes).map(cb => cb.value);

            // Display results
            const resultContainer = document.getElementById('expense-result');
            const summaryContainer = document.getElementById('expense-summary');
            const detailsContainer = document.getElementById('expense-details');

            summaryContainer.textContent = `${expenseType}：${totalAmount.toFixed(2)}元，共${checkboxes.length}人参与，人均：${perPerson.toFixed(2)}元`;
            detailsContainer.innerHTML = '';

            participants.forEach(participant => {
                const detailItem = document.createElement('div');
                detailItem.className = 'detail-item';
                detailItem.innerHTML = `
                    <span>${participant}</span>
                    <span>${perPerson.toFixed(2)}元</span>
                `;
                detailsContainer.appendChild(detailItem);
            });

            // Show result
            resultContainer.style.display = 'block';

            // Save expense to localStorage
            const expenseRecord = {
                type: expenseType,
                total: totalAmount,
                perPerson: perPerson,
                participants: participants,
                date: new Date().toISOString()
            };
            const expenseHistory = JSON.parse(localStorage.getItem('expenseHistory') || '[]');
            expenseHistory.push(expenseRecord);
            localStorage.setItem('expenseHistory', JSON.stringify(expenseHistory));
        }
