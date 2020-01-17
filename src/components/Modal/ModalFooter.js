import styled from 'styled-components'

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;

  button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    margin: 2rem 0 0;
    outline: 0;

    &:hover {
      color: #cecece;
    }
  }
`

export default ModalFooter
