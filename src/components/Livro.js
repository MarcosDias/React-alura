import React, {Component} from 'react';
import $ from 'jquery';
import InputCustomizado from './InputCustomizado';
import ButtonCustomizado from './ButtonCustomizado';
import PubSub from 'pubsub-js';
import TratadorErros from './../TratadorErros';

export default class LivroBox extends Component {
    constructor() {
        super();
        this.state = {
            lista: [],
            autores: []
        };
    }

    componentDidMount() {
        $.ajax({
            url: "http://localhost:8080/api/livros",
            dataType: 'json',
            success: (resposta) => {
                this.setState({lista: resposta});
            }
        });

        $.ajax({
            url: "http://localhost:8080/api/autores",
            dataType: 'json',
            success: (resposta) => {
                this.setState({autores: resposta});
            }
        });

        PubSub.subscribe('atualiza-lista-livros', (topico, novaLista) => {
            this.setState({lista: novaLista});
        });
    }

    render() {
        return (
            <div>
                <div className="header">
                    <h1>Cadastro de Livros</h1>
                </div>
                <div className="content" id="content">
                    <FormularioLivro autores={this.state.autores}/>
                    <TabelaLivros lista={this.state.lista}/>
                </div>

            </div>
        );
    }
}

class FormularioLivro extends Component {
    constructor() {
        super();
        this.state = {
            livro: {
                titulo: '',
                preco: '',
                autorId: ''
            }
        };
        this.handleInput = this.handleInput.bind(this);
        this.enviaForm = this.enviaForm.bind(this);
    }

    enviaForm(evento) {
        evento.preventDefault();
        $.ajax({
            url: 'http://localhost:8080/api/livros',
            contentType: 'application/json',
            dataType: 'json',
            type: 'post',
            data: JSON.stringify(this.state.livro),
            success: (novaListagem) => {
                PubSub.publish('atualiza-lista-livros', novaListagem);
                this.setState({
                    livro: {
                        titulo: '',
                        preco: '',
                        autorId: ''
                    }
                });
            },
            error: (resposta) => {
                if (resposta.status === 400) {
                    new TratadorErros().publicaErros(resposta.responseJSON);
                }
            },
            beforeSend: () => PubSub.publish('limpa-erros', {})
        });
    }

    handleInput(evento) {
        let livro = this.state.livro;
        livro[evento.target.name] = evento.target.value;
        this.setState({ livro });
    }

    render() {
        return (
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
                    <InputCustomizado id="nome" type="text" name="titulo" value={this.state.livro.titulo} onChange={this.handleInput} label="Título"/>
                    <InputCustomizado id="email" type="text" name="preco" value={this.state.livro.preco} onChange={this.handleInput} label="Preço"/>

                    <div className="pure-control-group">
                        <label htmlFor="autorId">Autor</label>
                        <select value="" name="autorId" id="autorId" onChange={this.handleInput}>
                            <option value="">Selecione um Autor</option>
                            {
                                this.props.autores.map( (autor) => {
                                    return <option key={autor.id} value={autor.id}>{autor.nome}</option>
                                })
                            }
                        </select>
                    </div>

                    <ButtonCustomizado type="submit" label="Gravar"/>
                </form>
            </div>
        );
    }
}

class TabelaLivros extends Component {
    render() {
        return (
            <div>
                <table className="pure-table">
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Preço</th>
                            <th>Autor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.lista.map(livro => {
                            return (
                                <tr key={livro.id}>
                                    <td>{livro.titulo}</td>
                                    <td>{livro.preco}</td>
                                    <td>{livro.autor.email}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    }
}
