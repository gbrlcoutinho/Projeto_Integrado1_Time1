import React, { useState, useEffect } from 'react';
import './FuncionarioModal.css'; // ATUALIZE O IMPORT DO CSS

// --- Nossas listas de opções "hardcoded" ---
const ALL_RESTRICOES = ['Final de Semana', 'Feriados', 'Plantão da ETA'];
const ALL_DISPONIBILIDADE = ['Plantão da Tarde', 'Plantão da Manhã', 'Feriados'];

function FuncionarioModal({ isOpen, onClose, initialMode, employee }) {
    const [currentMode, setCurrentMode] = useState(initialMode);

    // --- Estados para os campos do formulário ---
    const [nome, setNome] = useState('');
    const [cargo, setCargo] = useState('');
    const [telefone, setTelefone] = useState('');
    const [restricoes, setRestricoes] = useState([]);
    const [disponibilidade, setDisponibilidade] = useState([]);

    // --- Estados para controlar os dropdowns ---
    const [isRestricoesOpen, setRestricoesOpen] = useState(false);
    const [isDisponibilidadeOpen, setDisponibilidadeOpen] = useState(false);

    // --- PASSO 2.2: O useEffect que você perguntou ---
    // Ele "reseta" o modo interno toda vez que o modal é aberto
    // O local dele é aqui, depois dos 'useState' e antes do outro 'useEffect'.
    useEffect(() => {
        if (isOpen) {
            setCurrentMode(initialMode);
        }
    }, [isOpen, initialMode]); // <-- MUDANÇA AQUI (useEffect adicionado)


    // --- PASSO 2.3: Atualizado o useEffect para usar 'currentMode' ---
    useEffect(() => {
        // Agora ele usa 'currentMode' (o estado) em vez de 'mode' (o prop)
        if (isOpen && employee && (currentMode === 'edit' || currentMode === 'view')) { // <-- MUDANÇA AQUI
            // Se for 'edit' ou 'view', preenche os estados com os dados
            setNome(employee.name || '');
            setCargo(employee.function || '');
            setTelefone(employee.cellphone || '');
            // No seu código, os mocks usam 'constraints' e 'disponibility'
            setRestricoes(employee.constraints || []);
            setDisponibilidade(employee.disponibility || []);
        } else {
            // Se for 'create' (ou se fechar), limpa tudo
            setNome('');
            setCargo('');
            setTelefone('');
            setRestricoes([]);
            setDisponibilidade([]);
        }
    }, [isOpen, employee, currentMode]); // <-- MUDANÇA AQUI (dependência)

    // --- PASSO 2.4: Atualizado para usar 'currentMode' ---
    const isDisabled = currentMode === 'view'; // <-- MUDANÇA AQUI

    // --- Funções de clique ---
    const handleModalContentClick = (e) => {
        e.stopPropagation();
    };

    // --- PASSO 2.4: Atualizado para usar 'currentMode' ---
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = {
            nome,
            cargo,
            telefone,
            restricoes,
            disponibilidade
        };

        if (currentMode === 'create') { // <-- MUDANÇA AQUI
            console.log('CRIANDO FUNCIONÁRIO:', formData);
            // Aqui você chamaria sua API de criação
        } else if (currentMode === 'edit') { // <-- MUDANÇA AQUI
            console.log('ATUALIZANDO FUNCIONÁRIO:', employee.id, formData);
            // Aqui você chamaria sua API de atualização
        }
        onClose(); // Fecha o modal após o submit
    };

    // --- Funções das Pílulas (só funcionam se não estiver em modo 'view') ---
    const addRestricao = (tag) => {
        if (isDisabled) return;
        setRestricoes([...restricoes, tag]);
    };

    const addDisponibilidade = (tag) => {
        if (isDisabled) return;
        setDisponibilidade([...disponibilidade, tag]);
    };

    const removeRestricao = (tagToRemove) => {
        if (isDisabled) return;
        setRestricoes(restricoes.filter(tag => tag !== tagToRemove));
    };

    const removeDisponibilidade = (tagToRemove) => {
        if (isDisabled) return;
        setDisponibilidade(disponibilidade.filter(tag => tag !== tagToRemove));
    };

    const toggleRestricoesDropdown = () => {
        if (isDisabled) return;
        setRestricoesOpen(!isRestricoesOpen);
        setDisponibilidadeOpen(false);
    };

    const toggleDisponibilidadeDropdown = () => {
        if (isDisabled) return;
        setDisponibilidadeOpen(!isDisponibilidadeOpen);
        setRestricoesOpen(false);
    };

    // --- Listas filtradas (só mostram opções disponíveis) ---
    const availableRestricoes = ALL_RESTRICOES.filter(
        tag => !restricoes.includes(tag)
    );
    const availableDisponibilidade = ALL_DISPONIBILIDADE.filter(
        tag => !disponibilidade.includes(tag)
    );

    // --- PASSO 2.4: Atualizado para usar 'currentMode' ---
    let modalTitle = 'Cadastrar Funcionário';
    if (currentMode === 'edit') modalTitle = 'Editar Funcionário'; // <-- MUDANÇA AQUI
    if (currentMode === 'view') modalTitle = 'Visualizar Funcionário'; // <-- MUDANÇA AQUI

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={handleModalContentClick}>

                <div className="modal-header">
                    <h2>{modalTitle}</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        &times;
                    </button>
                </div>

                <form className="modal-form" onSubmit={handleSubmit}>

                    <div className="form-group full-width">
                        <input
                            type="text"
                            id="nome"
                            placeholder=" "
                            required={!isDisabled}
                            disabled={isDisabled}
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                        />
                        <label htmlFor="nome">Nome Completo</label>
                    </div>

                    <div className="form-group">
                        <select
                            id="cargo"
                            required={!isDisabled}
                            disabled={isDisabled}
                            value={cargo}
                            onChange={(e) => setCargo(e.target.value)}
                        >
                            <option value="" disabled hidden>Selecione um cargo</option>
                            <option value="Operador da ETA">Operador da ETA</option>
                            <option value="Encanador">Encanador</option>
                        </select>
                        <label htmlFor="cargo">Cargo/Função</label>
                        <span className="select-arrow"></span>
                    </div>

                    <div className="form-group">
                        <input
                            type="tel"
                            id="telefone"
                            placeholder=" "
                            required={!isDisabled}
                            disabled={isDisabled}
                            value={telefone}
                            onChange={(e) => setTelefone(e.target.value)}
                        />
                        <label htmlFor="telefone">Telefone/Celular</label>
                    </div>

                    {/* --- Campo de Restrições --- */}
                    <div className="form-group full-width">
                        <div
                            className={`tag-input-container ${isDisabled ? 'disabled' : ''}`}
                            onClick={toggleRestricoesDropdown}
                        >
                            {restricoes.map(tag => (
                                <span key={tag} className={`tag tag-restricao ${isDisabled ? 'disabled' : ''}`}>
                                    <span>{tag}</span>
                                    {!isDisabled && (
                                        <button
                                            type="button"
                                            className="tag-close"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeRestricao(tag);
                                            }}
                                        >
                                            &times;
                                        </button>
                                    )}
                                </span>
                            ))}
                        </div>
                        <label htmlFor="restricoes">Restrições</label>
                        <span
                            className={`select-arrow ${isRestricoesOpen ? 'open' : ''}`}
                            onClick={toggleRestricoesDropdown}
                        ></span>

                        {isRestricoesOpen && !isDisabled && (
                            <div className="custom-dropdown-menu">
                                {availableRestricoes.length > 0 ? (
                                    availableRestricoes.map(tag => (
                                        <div
                                            key={tag}
                                            className="dropdown-item tag-restricao"
                                            onClick={() => addRestricao(tag)}
                                        >
                                            {tag}
                                        </div>
                                    ))
                                ) : (
                                    <div className="dropdown-empty-message">
                                        Nenhuma opção restante.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* --- Campo de Disponibilidade --- */}
                    <div className="form-group full-width">
                        <div
                            className={`tag-input-container ${isDisabled ? 'disabled' : ''}`}
                            onClick={toggleDisponibilidadeDropdown}
                        >
                            {disponibilidade.map(tag => (
                                <span key={tag} className={`tag tag-disponibilidade ${isDisabled ? 'disabled' : ''}`}>
                                    <span>{tag}</span>
                                    {!isDisabled && (
                                        <button
                                            type="button"
                                            className="tag-close"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeDisponibilidade(tag);
                                            }}
                                        >
                                            &times;
                                        </button>
                                    )}
                                </span>
                            ))}
                        </div>
                        <label htmlFor="disponibilidade">Disponibilidade</label>
                        <span
                            className={`select-arrow ${isDisponibilidadeOpen ? 'open' : ''}`}
                            onClick={toggleDisponibilidadeDropdown}
                        ></span>

                        {isDisponibilidadeOpen && !isDisabled && (
                            <div className="custom-dropdown-menu">
                                {availableDisponibilidade.length > 0 ? (
                                    availableDisponibilidade.map(tag => (
                                        <div
                                            key={tag}
                                            className="dropdown-item tag-disponibilidade"
                                            onClick={() => addDisponibilidade(tag)}
                                        >
                                            {tag}
                                        </div>
                                    ))
                                ) : (
                                    <div className="dropdown-empty-message">
                                        Nenhuma opção restante.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* --- PASSO 2.4 & 2.5: Botões do Rodapé Dinâmicos --- */}
                    <div className="modal-footer full-width">
                        {currentMode === 'create' && ( // <-- MUDANÇA AQUI
                            <button type="submit" className="modal-submit-btn">
                                CADASTRAR
                            </button>
                        )}
                        {currentMode === 'edit' && ( // <-- MUDANÇA AQUI
                            <button type="submit" className="modal-submit-btn">
                                SALVAR ALTERAÇÕES
                            </button>
                        )}
                        {currentMode === 'view' && ( // <-- MUDANÇA AQUI
                            <>
                                <button
                                    type="button"
                                    className="modal-edit-btn"
                                    onClick={() => setCurrentMode('edit')} // <-- MUDANÇA AQUI
                                >
                                    EDITAR
                                </button>
                                <button type="button" className="modal-delete-btn">
                                    EXCLUIR
                                </button>
                            </>
                        )}
                    </div>

                </form>
            </div>
        </div>
    );
}

export default FuncionarioModal;