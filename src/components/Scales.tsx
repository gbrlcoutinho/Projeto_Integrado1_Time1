import React, { useState, useEffect } from 'react';
import './Scales.css'; 
import { getScale } from '../ipc-bridge/scale';

const Scales: React.FC = () => {
    // Estado da data atual do calendário
    const [currentDate, setCurrentDate] = useState(new Date());
    
    // Estado para armazenar os turnos vindos do banco
    const [shifts, setShifts] = useState<any[]>([]);
    
    // Estado para o tipo de escala
    const [scaleType, setScaleType] = useState<'ETA' | 'PLANTAO_TARDE'>('ETA');

    // Nomes dos dias da semana
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    // Busca os dados sempre que o Mês ou o Tipo de escala mudar
    useEffect(() => {
      const fetchScale = async () => {
        try {
          // Formata a data para o formato que o Back-end espera
          const year = currentDate.getFullYear();
          const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // +1 porque Jan é 0
          const monthString = `${year}-${month}`;

          // Chama o Electron
          const result = await getScale({ month: monthString, type: scaleType });

          if (result && result.shifts) {
            // Se achou escala, guarda os turnos
            setShifts(result.shifts);
          } else {
            // Se não achou, limpa os turnos
            setShifts([]);
          }
        } catch (error) {
          console.error("Erro ao buscar escala:", error);
          setShifts([]);
        }
      };

      fetchScale();
    }, [currentDate, scaleType]); // Roda se mudar a data ou o tipo

    // Muda o mês
    const changeMonth = (delta: number) => {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1);
      setCurrentDate(newDate);
    };

    // Gera os dias do calendário
    const renderCalendarDays = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      const firstDayOfMonth = new Date(year, month, 1);
      const startDayIndex = firstDayOfMonth.getDay(); 
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const calendarCells: { dateStr: string; day: number; isCurrentMonth: boolean }[] = [];

      // Helper para formatar data YYYY-MM-DD localmente (evita problemas de fuso horário do toISOString)
      const formatDateStr = (y: number, m: number, d: number) => {
        const mm = String(m + 1).padStart(2, '0');
        const dd = String(d).padStart(2, '0');
        return `${y}-${mm}-${dd}`;
      };

      // Dias do mês anterior
      const prevMonthDays = new Date(year, month, 0).getDate();
      for (let i = startDayIndex; i > 0; i--) {
        const dayNum = prevMonthDays - i + 1;
        const dObj = new Date(year, month - 1, dayNum);
        calendarCells.push({ 
            dateStr: formatDateStr(dObj.getFullYear(), dObj.getMonth(), dObj.getDate()), 
            day: dayNum, 
            isCurrentMonth: false 
        });
      }

      // Dias do mês atual
      for (let day = 1; day <= daysInMonth; day++) {
        calendarCells.push({ 
            dateStr: formatDateStr(year, month, day), 
            day, 
            isCurrentMonth: true 
        });
      }

      // Preencher linhas restantes
      const totalNeeded = startDayIndex + daysInMonth;
      const target = totalNeeded > 35 ? 42 : 35;

      if (calendarCells.length < target) {
        const toAdd = target - calendarCells.length;
        for (let i = 1; i <= toAdd; i++) {
           const dObj = new Date(year, month + 1, i);
           calendarCells.push({ 
               dateStr: formatDateStr(dObj.getFullYear(), dObj.getMonth(), dObj.getDate()), 
               day: i, 
               isCurrentMonth: false 
           });
        }
      }

      // Renderiza cada célula da grid cruzando com os dados do 'shifts'
      return calendarCells.map((cell, index) => {
        const todayStr = formatDateStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
        const isToday = cell.dateStr === todayStr;

        // Filtra os turnos para este dia específico
        const dailyShifts = shifts.filter(s => s.date === cell.dateStr);

        return (
          <div
            key={index}
            className={`day-cell ${!cell.isCurrentMonth ? 'inactive' : ''} ${isToday ? 'today' : ''}`}
          >
            <div className="day-number">{cell.day}</div>
            <div className="day-events">
              {dailyShifts.map((shift, i) => (
                <div key={i} className="event-block yellow" title={shift.employee_name}>
                  {/* Mostra apenas o primeiro nome ou nome completo conforme espaço */}
                  {shift.employee_name}
                </div>
              ))}
            </div>
          </div>
        );
      });
    };

  const monthStr = currentDate.toLocaleDateString('pt-BR', { month: 'long' });
  const yearStr = currentDate.getFullYear();
  const monthCap = monthStr.charAt(0).toUpperCase() + monthStr.slice(1);

  return (
    <div className="scales-page-container">
      <div className="calendar-header-actions">
        <div className="calendar-nav">
          <button onClick={() => changeMonth(-1)} className="nav-button">❮</button>
            <h3 className="month-title">
                <span className="prefix-text">Escala Mensal -</span> 
                <span className="month-text">{monthCap}</span> 
                <span className="year-text">{yearStr}</span>
            </h3>
          <button onClick={() => changeMonth(1)} className="nav-button">❯</button>
        </div>
        <div className="action-buttons">
            <button className="btn-action primary">BAIXAR</button>
            <button className="btn-action secondary">PUBLICAR</button>
            <button className="btn-action edit">EDITAR</button>
        </div>
      </div>
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