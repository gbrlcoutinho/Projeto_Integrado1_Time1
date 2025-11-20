
import React, { useState } from 'react';
import './Scales.css'; 

// Renomeamos a função para Scales
const Scales: React.FC = () => {
    // 1. Estado para a data atual
    const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 1));
    
    // 2. Mockup de dados de Escalas para exibição
    const scalesData = [
      { day: 10, employee: 'Valdomir Ferreira Santiago', color: 'yellow' },
      { day: 16, employee: 'Valdomir Ferreira Santiago', color: 'blue' },
      // ... (Outros dados)
    ];

    // Nomes dos dias da semana
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    // Funções de navegação (mudar mês)
    const changeMonth = (delta: number) => {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1);
      setCurrentDate(newDate);
    };

    // --- LÓGICA DE GERAÇÃO DOS DIAS DA GRID (5 linhas x 7 colunas = 35 células) ---
    const renderCalendarDays = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      const firstDayOfMonth = new Date(year, month, 1);
      const startDayIndex = firstDayOfMonth.getDay(); // 0 (Dom) .. 6 (Sáb)
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const calendarCells: { date: Date; day: number; isCurrentMonth: boolean }[] = [];

      // Preencher com dias do mês anterior que caem antes do dia 1
      const prevMonthDays = new Date(year, month, 0).getDate();
      for (let i = startDayIndex; i > 0; i--) {
        const d = new Date(year, month - 1, prevMonthDays - i + 1);
        calendarCells.push({ date: d, day: d.getDate(), isCurrentMonth: false });
      }

      // Dias do mês atual
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, month, day);
        calendarCells.push({ date: d, day, isCurrentMonth: true });
      }

      // Decide se precisamos de 5 linhas (35 células) ou 6 linhas (42 células)
      // totalNeeded = dias anteriores (startDayIndex) + dias do mês
      const totalNeeded = startDayIndex + daysInMonth;
      const target = totalNeeded > 35 ? 42 : 35; // usar 6 linhas quando necessário

      if (calendarCells.length > target) {
        // Se por alguma razão já temos mais, corta para o target calculado
        calendarCells.splice(target);
      }

      // Se faltam células, preenche com dias do próximo mês
      if (calendarCells.length < target) {
        const toAdd = target - calendarCells.length;
        for (let i = 1; i <= toAdd; i++) {
          const d = new Date(year, month + 1, i);
          calendarCells.push({ date: d, day: d.getDate(), isCurrentMonth: false });
        }
      }

      // Renderiza cada célula da grid
      return calendarCells.map((cell, index) => {
        const today = new Date();
        const isToday = cell.date.toDateString() === today.toDateString();
        const dailyScales = cell.isCurrentMonth
          ? scalesData.filter(scale => scale.day === cell.day)
          : [];

        return (
          <div
            key={index}
            className={`day-cell ${!cell.isCurrentMonth ? 'inactive' : ''} ${isToday ? 'today' : ''}`}
          >
            <div className="day-number">{cell.day}</div>
            <div className="day-events">
              {dailyScales.map((scale, i) => (
                <div key={i} className={`event-block ${scale.color}`} title={scale.employee}>
                  {scale.employee}
                </div>
              ))}
            </div>
          </div>
        );
      });
    };
    // Fim da lógica de geração dos dias

  const monthYearStr = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const monthStr = currentDate.toLocaleDateString('pt-BR', { month: 'long' });
  const yearStr = currentDate.getFullYear();

  // Capitalize month (e.g., 'dezembro' -> 'Dezembro')
  const monthCap = monthStr.charAt(0).toUpperCase() + monthStr.slice(1);

  return (
    <div className="scales-page-container"> {/* Mantive o nome da classe para reuso do CSS */}
      {/* 1. HEADER DO CALENDÁRIO */}
      <div className="calendar-header-actions">
        <div className="calendar-nav">
          <button onClick={() => changeMonth(-1)} className="nav-button">❮</button>
                    <h3 className="month-title"><span className="prefix-text">Escala Mensal -</span> <span className="month-text">{monthCap}</span> <span className="year-text">{yearStr}</span></h3>
          <button onClick={() => changeMonth(1)} className="nav-button">❯</button>
        </div>
                {/* ... Botões de Ação ... */}
                <div className="action-buttons">
                    <button className="btn-action primary">BAIXAR</button>
                    <button className="btn-action secondary">PUBLICAR</button>
          <button className="btn-action edit">EDITAR</button>
                </div>
            </div>
            
            {/* 2. GRID DO CALENDÁRIO */}
            <div className="calendar-grid-container">
                <div className="weekdays-header">
                    {weekDays.map(day => (<div key={day} className="weekday">{day}</div>))}
                </div>
                <div className="days-grid">
                    {renderCalendarDays()}
                </div>
            </div>
        </div>
    );
};

export default Scales;