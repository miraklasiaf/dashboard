import { Container, Input, FormControl, FormLabel, InputGroup, InputLeftElement, FormErrorMessage, Icon } from "@chakra-ui/react";
import { ArrowUpIcon } from '@chakra-ui/react';
import { useController } from "react-hook-form";
import { useRef } from "react";

export const FileUpload = ({ name, placeholder, acceptedFileTypes, control, children, isRequired = false }) => {
    
	const inputRef = useRef();

	const {
		field: { ref, onChange, value, ...inputProps },
		fieldState: { invalid, isTouched, isDirty },
	} = useController({
		name,
		control,
		rules: { required: isRequired },
	});

	const uploadfunction = (e) => {
		onChange(e.target.files[0]);
		const file = e.target.files[0];
		console.log("Uploaded a file");
		console.log("File name", file.name);
	  }

	return (
		<Container>
			<FormControl isInvalid={invalid} isRequired>
				<FormLabel htmlFor="writeUpFile">{children}</FormLabel>
				<InputGroup>
					<InputLeftElement
						pointerEvents="none">
						<Icon as={ArrowUpIcon} />
					</InputLeftElement>
					<input type='file'
						// onChange={(e) => onChange(e.target.files[0])}
						onChange={uploadfunction}
						accept={acceptedFileTypes}
						name={name}
						ref={inputRef}
						{...inputProps}
						style={{display: 'none'}} />
					<Input
						placeholder={placeholder || "Your file ..."}
						onClick={() => inputRef.current.click()}
						readOnly={true}
						value={value && value.name || ''}
					/>
				</InputGroup>
				<FormErrorMessage>
					{invalid}
				</FormErrorMessage>
			</FormControl>
		</Container>

	);
}

FileUpload.defaultProps = {
	acceptedFileTypes: '',
	allowMultipleFiles: false,
};

export default FileUpload;