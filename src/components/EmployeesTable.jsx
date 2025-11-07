// src/components/EmployeesTable.jsx

import React, { useState, useEffect, useRef } from 'react';
import { getAllEmployees } from '../employeeService.js'; // Mantemos, mas não usamos
import './EmployeesTable.css';
import SearchIcon from './SearchIcon';

// --- INÍCIO DAS MUDANÇAS ---
import FuncionarioModal from './FuncionarioModal/FuncionarioModal.jsx'; // Nome do modal corrigido
import { mockEmployees } from '../mockData.js'; // Importamos os mocks
// import { use } from 'react'; // 'use' não estava sendo usado, removido
// --- FIM DAS MUDANÇAS ---

// DADOS MOCKADOS (bloco antigo removido)
const ITEMS_PER_PAGE = 10;

function EmployeesTable() {
  // --- ESTADOS ---
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Novos estados para a funcionalidade da UI
  const [searchTerm, setSearchTerm] = useState('');

  // --- INÍCIO DAS MUDANÇAS: Estados do Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  // --- FIM DAS MUDANÇAS ---

  const [searchText, setSearchText] = useState('');
  const searchInputRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const firstRowIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const lastRowIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalCount);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  }

  // --- INÍCIO DAS MUDANÇAS: useEffect usando MOCKS ---
  useEffect(() => {
    const fetchEmployees = () => {
      try {
        if (loading) return;
        setLoading(true);
        setError(null);

        // 1. Simula a busca (filtra os mocks)
        const filteredEmployees = mockEmployees.filter(emp =>
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.function.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // 2. Simula a paginação
        const total = filteredEmployees.length;
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const paginatedEmployees = filteredEmployees.slice(start, end);

        // 3. Simula a resposta da API (com um delay falso)
        setTimeout(() => {
          setAllEmployees(paginatedEmployees);
          setTotalCount(total);
          setLoading(false);
        }, 300); // 300ms de "loading"

      } catch (err) {
        console.error("Erro ao simular dados dos funcionários:", err);
        setError(err.message || "Erro desconhecido");
        setAllEmployees([]);
        setTotalCount(0);
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [currentPage, searchTerm]);
  // --- FIM DAS MUDANÇAS: useEffect ---


  // Estes useEffects vieram da 'main' e são necessários para a busca funcionar
  useEffect(() => {
    if (searchText === searchTerm) return;
    const delaySearch = setTimeout(() => {
      setSearchTerm(searchText);
    }, 300);
    return () => clearTimeout(delaySearch);
  }, [searchText, searchTerm]);

  useEffect(() => {
    if (searchTerm && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, currentPage]);

  useEffect(() => {
    if (!loading && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [loading]);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // --- INÍCIO DAS MUDANÇAS: Funções do Modal ---
  const openCreateModal = () => {
    setModalMode('create');
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const openViewModal = (employee) => {
    setModalMode('view');
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  // Não precisamos do openEditModal aqui, pois ele é chamado de dentro do 'view'

  const closeModal = () => {
    setIsModalOpen(false);
  };
  // --- FIM DAS MUDANÇAS ---

  // (A função renderTags foi removida pois não estava sendo usada)

  // --- RENDERIZAÇÃO DE ESTADOS DE CARREGAMENTO E ERRO ---
  if (loading) {
    // (Vamos mostrar a tabela mesmo durante o loading, fica mais suave)
  }

  if (error) {
    return <p style={{ color: 'red' }}> Ocorreu um erro: {error}</p>;
  }

  // --- RENDERIZAÇÃO PRINCIPAL ---
  return (
    <div className="employees-page">
      <div className="funcionarios-container">

        <header className="page-header">
          <h1>Funcionários</h1>
          <button
            className="btn btn-primary"
            onClick={openCreateModal} // <-- MUDANÇA AQUI
          >
            CADASTRAR FUNCIONÁRIO
          </button>
        </header>

        {/* --- CÓDIGO CORRIGIDO (Como no Figma) --- */}
        <div className="search-container">
          {/* 1. A label estática "Pesquisar" (que estava faltando) */}
          <label htmlFor="searchInput" className="search-label">Pesquisar</label>
          <div className="search-input-wrapper">
            <input
              type="text"
              ref={searchInputRef}
              id="searchInput"
              placeholder="Nome, cargo/função" {/* 2. Placeholder de volta */}
              className="search-input"
              value={searchText}
              onChange={handleSearchChange}
            />
            <div className="search-icon">
              <SearchIcon />
            </div>
          </div>
        </div>

        <main className="tabela-container">
          <table>
            <thead>
              <tr>
                <th><strong>Nome Completo</strong></th>
                <th><strong>Cargo/Função</strong></th>
                <th><strong>Celular</strong></th>
                {/* Coluna "Ações" removida para bater com o Figma */}
              </tr>
            </thead>
            <tbody>
              {allEmployees.length > 0 ? (
                allEmployees.map((emp) => (
                  // --- INÍCIO DAS MUDANÇAS: Linha clicável ---
                  <tr key={emp.id} className="clickable-row" onClick={() => openViewModal(emp)}>
                    <td data-label="Nome Completo">{emp.name}</td>
                    <td data-label="Cargo/Função">{emp.function}</td>
                    <td data-label="Celular">{emp.cellphone || '—'}</td>
                    {/* Coluna "Ações" removida */}
                  </tr>
                  // --- FIM DAS MUDANÇAS ---
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="no-results"> {/* Colspan 3, não 4 */}
                    {loading ? "Buscando..." : "Nenhum funcionário encontrado."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </main>

        <footer className="funcionarios-footer">
          <span>Linhas por página: {ITEMS_PER_PAGE} </span>
          {totalCount > 0 && (
            <span>{firstRowIndex}-{lastRowIndex} de {totalCount}</span>
          )}

          <div className="pagination-controls">
            <button
              className='btn btn-primary'
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              &lt; Anterior
            </button>
            <button
              className='btn btn-primary'
              onClick={goToNextPage}
              disabled={currentPage >= totalPages || totalPages === 0 || loading}
            >
              Próximo &gt;
            </button>
          </div>
        </footer>
      </div>

      {/* --- INÍCIO DAS MUDANÇAS: Chamada do Modal Universal --- */}
      <FuncionarioModal
        isOpen={isModalOpen}
        onClose={closeModal}
        initialMode={modalMode}
        employee={selectedEmployee}
      />
      {/* --- FIM DAS MUDANÇAS --- */}
    </div>
  );
}

export default EmployeesTable;